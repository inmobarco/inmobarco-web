# Despliegue en el VPS

Cómo publicar este sitio en el VPS de Contabo con Easypanel. Sirve igual para el
preview de avances y para producción: lo único que cambia es el dominio y una
variable de entorno.

## Qué hace falta antes de empezar

- El repositorio en GitHub, con la rama que se quiere desplegar actualizada.
- Acceso a Easypanel en el VPS.
- Un subdominio apuntando al VPS. Para el preview, por ejemplo
  `preview.inmobarco.com`: un registro **A** hacia la IP del servidor.
- Las credenciales de Wasi y la URL del webhook de n8n.

No hace falta instalar Node, pnpm ni nada en el servidor: todo se compila dentro
de la imagen de Docker.

## Por qué el repositorio tiene que llevar estos archivos

El servidor no compila con los archivos de tu máquina: clona el repositorio y
construye la imagen a partir de lo que encuentre allí. Si algo no está
**confirmado en git**, para el servidor no existe.

| Archivo | Por qué es obligatorio |
|---|---|
| `Dockerfile` | Es la receta de la imagen. Sin él, Easypanel no sabe cómo construir. |
| `pnpm-lock.yaml` | Fija la versión exacta de cada dependencia. |
| `pnpm-workspace.yaml` | Lleva el `allowBuilds` con el que pnpm 12 autoriza los scripts de instalación de sharp, esbuild y oxide. Sin él la instalación se detiene con `ERR_PNPM_IGNORED_BUILDS`. |
| `nuxt.config.ts` con `nitro: { preset: 'node-server' }` | Hace que el build produzca un servidor Node ejecutable. Con otro preset, `.output/server/index.mjs` no existe y el contenedor arranca y muere. |

Sobre el lockfile en concreto: el `Dockerfile` instala con
`pnpm install --frozen-lockfile`. Esa bandera significa *«instala exactamente lo
que dice el lockfile y no lo modifiques»*. Si el archivo falta, o si está
desactualizado respecto a `package.json`, pnpm **falla en vez de improvisar**.

Es lo que se quiere. La alternativa —dejar que resuelva versiones por su
cuenta— haría que la imagen de hoy y la de dentro de un mes instalen
dependencias distintas sin que nadie lo haya decidido, y que un fallo aparezca
en producción sin un solo cambio en el código. Por eso, **cada vez que se
añada o actualice una dependencia hay que confirmar el `pnpm-lock.yaml`
junto al `package.json`**. Si se olvida, el despliegue falla con
`ERR_PNPM_OUTDATED_LOCKFILE`.

## Variables de entorno

Se configuran en Easypanel, nunca en el repositorio. El `.env` local está
ignorado en git y excluido de la imagen por `.dockerignore`.

```
NUXT_WASI_ID_COMPANY=...
NUXT_WASI_TOKEN=...
NUXT_N8N_WEBHOOK_URL=https://automa-inmobarco-n8n.druysh.easypanel.host/webhook/
NUXT_PUBLIC_SITE_URL=https://preview.inmobarco.com
```

Opcionales, cuando existan:

```
NUXT_TURNSTILE_SECRET_KEY=...
NUXT_PUBLIC_TURNSTILE_SITE_KEY=...
NUXT_PUBLIC_GTAG_ID=...
```

### Indexación: apagada salvo que se pida

El sitio **no se entrega a los buscadores** a menos que exista
`NUXT_SITE_INDEXABLE=true` en el entorno. Sin esa variable sirve `Disallow: /` en
`robots.txt` y la cabecera `X-Robots-Tag: noindex, nofollow`.

Es decir: **el preview no necesita configuración**, y es **producción** la que
tiene que activarla:

```
NUXT_SITE_INDEXABLE=true      # solo en inmobarco.com
```

El defecto está puesto en ese sentido a conciencia. Olvidarla en producción deja
el sitio sin indexar: se nota y se arregla en un minuto. Al revés —un preview
compitiendo en Google contra el sitio real con el mismo contenido— tarda semanas
en revertirse.

Se lee al arrancar el contenedor, así que cambiarla **no exige reconstruir**:
basta con guardarla y reiniciar el servicio.

**Compruébalo siempre después de desplegar:**

```bash
curl -s https://TU-DOMINIO/robots.txt
```

En el preview debe decir `Disallow: /`. En producción, `Disallow:` a secas y la
línea del `Sitemap:`.

## Pasos en Easypanel

1. **Crear el servicio.** Proyecto → *Create Service* → **App**. Nómbralo
   `inmobarco-web`.
2. **Origen.** Pestaña *Source* → **GitHub**. Elige el repositorio
   `inmobarco/inmobarco-web` y la rama. Si el repositorio es privado, hay que
   conectar la cuenta de GitHub a Easypanel primero.
3. **Método de construcción.** Pestaña *Build* → **Dockerfile**. Ruta:
   `Dockerfile`. No hay que tocar nada más: la receta está en el repositorio.
4. **Variables.** Pestaña *Environment* → pega el bloque de arriba.
5. **Dominio.** Pestaña *Domains* → *Add domain* → `preview.inmobarco.com`,
   **puerto 3000**, y activa **HTTPS**. Traefik pide el certificado a Let's
   Encrypt solo; solo necesita que el DNS ya apunte al servidor.
6. **Desplegar.** Botón *Deploy*. El primer build tarda varios minutos porque
   descarga todas las dependencias; los siguientes reutilizan capas y son mucho
   más rápidos.

## Comprobaciones después del primer despliegue

```bash
# El contenedor está vivo
curl -s https://preview.inmobarco.com/api/health

# El inventario llega desde Wasi
curl -s "https://preview.inmobarco.com/api/properties?pageSize=1"

# El preview no se indexa
curl -s https://preview.inmobarco.com/robots.txt
```

Si `/api/health` responde pero `/api/properties` da 503, el contenedor está bien
y lo que falla son las credenciales de Wasi: revisa las variables y vuelve a
desplegar. Los logs del contenedor lo dicen con el prefijo `[wasi]`.

## Cosas que conviene saber

**No levantes nginx en el host.** Traefik ya escucha en los puertos 80 y 443. En
este VPS los dos han chocado antes; si aparece nginx, `systemctl mask nginx`.

**Una sola réplica, por ahora.** El caché de las respuestas de Wasi vive en la
memoria del proceso. Con dos réplicas cada una tendría su propio caché: no se
rompe nada, pero se duplican las llamadas a Wasi y el contenido puede diferir
entre ellas por unos minutos. Antes de escalar hay que apuntar el storage de
Nitro a Redis.

**El primer arranque es más lento.** La primera visita a la home y a cada listado
llena el caché llamando a Wasi. A partir de ahí se sirven desde memoria durante
15 minutos.

**Los formularios ya están activos.** Las páginas legales están publicadas, así
que `/api/contact` y `/api/consign` aceptan envíos y los entregan a n8n. Si el
preview va a ser público, cada prueba que haga alguien llega de verdad a n8n.

**Turnstile no está configurado.** Mientras no existan las claves, el antispam es
el campo trampa y el límite de cinco envíos por IP cada diez minutos. El servidor
lo avisa en cada envío con `[turnstile] sin clave configurada`.

## Actualizar el sitio

Cada `git push` a la rama configurada se puede desplegar desde el botón *Deploy*
de Easypanel, o automáticamente si activas *Auto Deploy* con el webhook de
GitHub.

Recuerda: si el cambio tocó dependencias, el `pnpm-lock.yaml` tiene que ir en el
mismo commit.
