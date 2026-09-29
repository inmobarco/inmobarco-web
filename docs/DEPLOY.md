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

### Adjuntos de mantenimiento (Cloudflare R2)

El formulario de `/mantenimiento` admite fotos y video. Los archivos **no pasan por este
servidor**: el navegador los sube directo al bucket con una URL que firma Nitro y caduca en
cinco minutos.

```
NUXT_R2_ENDPOINT=https://<id-de-cuenta>.r2.cloudflarestorage.com
NUXT_R2_BUCKET=...
NUXT_R2_ACCESS_KEY_ID=...
NUXT_R2_SECRET_ACCESS_KEY=...
NUXT_R2_REGION=auto
```

De los tres valores que muestra Cloudflare al crear el token de API, aquí se usan **Access Key
ID** y **Secret Access Key**. El «Token value» no: ese sirve para la API de Cloudflare, no para
el protocolo S3.

Si el bucket se creó con jurisdicción, el endpoint lleva la jurisdicción en medio
(`https://<id>.eu.r2.cloudflarestorage.com`) y entonces **`NUXT_R2_REGION` tiene que ser esa
jurisdicción** (`eu`) y no `auto`. Si no coincide, R2 responde 403 sin decir por qué.

Mientras falte cualquiera de las variables, el formulario funciona igual pero sin adjuntos y lo
dice en pantalla. No hay que desactivar nada.

#### Estructura del bucket

El sitio **no puede archivar por radicado**: los archivos se suben mientras el usuario llena el
formulario, y el radicado lo asigna n8n al recibir el envío, que ocurre después. Por eso hay dos
zonas y un traslado en medio.

**Lo que escribe el sitio** —lo único que escribe— es una bandeja de entrada agrupada por envío:

```
entrantes/{id-envio}/{uuid}.jpg
```

El `id-envio` es un UUID que genera el navegador al abrir el formulario y que viaja también en
el JSON del envío, en el campo `attachmentPrefix`. Con él, n8n sabe exactamente qué carpeta
recoger.

**Lo que arma n8n** al asignar el radicado, copiando desde la bandeja y borrando el original:

```
mantenimientos/{año}/{mes}/{radicado}/antes/{uuid}.jpg       # lo que subió el cliente
mantenimientos/{año}/{mes}/{radicado}/despues/{uuid}.jpg     # fotos del técnico al cerrar
mantenimientos/{año}/{mes}/{radicado}/soportes/factura.pdf   # facturas y remisiones
```

Las dos últimas carpetas no las toca el sitio nunca: son de la operación, y quien las escriba
—n8n o quien atienda la orden— usa sus propias credenciales.

#### Reglas de ciclo de vida

Se crean en **R2 > el bucket > Settings > Object lifecycle rules > Add rule**. Cada regla pide
un nombre, un prefijo y una acción; aquí la acción siempre es *Delete uploaded objects after*.

Hacen falta **dos, y con prefijos que no se solapen**. Es la razón por la que `entrantes/`
cuelga de la raíz y no de `mantenimientos/`: con prefijos anidados, la regla corta se aplicaría
también a lo archivado y borraría la evidencia de todos los radicados sin que nadie se entere.

| Nombre | Prefijo | Borrar a los | Por qué |
|---|---|---|---|
| `archivo-mantenimiento` | `mantenimientos/` | el plazo acordado | Es lo que hace cierta la promesa de la política de tratamiento. Sin esta regla los archivos viven para siempre. |
| `bandeja-entrantes` | `entrantes/` | 1 día | Recoge lo que alguien subió y luego abandonó el formulario. |

**El orden en que se activan importa, y mucho.** Mientras n8n no copie de `entrantes/` a
`mantenimientos/`, la bandeja es el único sitio donde existen las evidencias: activar ahí una
regla de un día **borra reportes de verdad al día siguiente**.

Así que: la regla de `mantenimientos/` se puede crear desde ya, porque no hay nada que pueda
romper. La de `entrantes/` **se crea después de que el traslado en n8n funcione**. Si se quiere
tener algo entretanto, que sea de 30 días y no de uno.

#### CORS

Hay que configurarlo en el bucket o el navegador no podrá hacer `PUT`, por bien firmada que esté
la URL.

```json
[
  {
    "AllowedOrigins": [
      "https://automa-inmobarco-inmobarco-web.druysh.easypanel.host",
      "https://inmobarco.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

**Los orígenes van sin barra final.** El navegador manda la cabecera `Origin` como
`https://servidor.com`, nunca `https://servidor.com/`, y R2 compara la cadena tal cual: con la
barra de más la regla no coincide nunca y la subida falla con un error de CORS que no dice qué
pasó.

`http://localhost:3000` está para poder probar con `pnpm dev`. Ojo con el puerto: si el 3000 está
ocupado, Nuxt arranca en el 3001 y ese es otro origen distinto para el navegador. Hay que mirar el
que imprime `pnpm dev` al arrancar y que sea el que está en la lista.

Localhost en la lista no abre nada: para escribir en el bucket sigue haciendo falta una URL
firmada por el servidor.

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
