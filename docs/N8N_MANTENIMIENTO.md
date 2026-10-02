# Flujo de n8n: reportes de mantenimiento de Inmobarco

Documento de encargo para quien monte el flujo. Se puede leer sin conocer el resto del
proyecto.

## Contexto

Inmobarco es una inmobiliaria de Medellín. Su sitio web tiene un formulario en
`/mantenimiento` donde un arrendatario o un propietario reporta una falla en el inmueble
—una gotera, un corto, la nevera— y adjunta fotos o un video.

**El sitio ya está construido y funcionando.** Hace tres cosas y ninguna más:

1. Recoge el formulario y lo valida.
2. Deja que el navegador suba los adjuntos **directo a un bucket de Cloudflare R2**, con
   una URL firmada. Los archivos no pasan por el servidor del sitio ni por n8n.
3. Hace `POST` a un webhook de n8n con los datos y la referencia a esos archivos, y
   **muestra en pantalla el número de radicado que n8n le devuelva**.

Todo lo demás —asignar el radicado, avisar por correo, organizar los archivos— es trabajo
de n8n. El sitio no envía correos ni sabe a quién le toca cada reporte.

El webhook ya existe: `web-maintenance`. Hoy devuelve siempre la misma cadena fija y no
hace nada más. Lo que falta es todo lo de este documento.

## Lo que recibe el webhook

Un `POST` con este cuerpo. Los campos son estables; el sitio ya los manda todos.

```json
{
  "kind": "maintenance",
  "submittedAt": "2026-09-30T14:22:05.123Z",
  "data": {
    "submissionId": "392bbd56-e696-4cf2-9e1f-985c18549622",

    "name": "Ana María Restrepo",
    "documentNumber": "1017123456",
    "email": "ana@example.com",
    "phone": "3001234567",
    "clientType": "arrendatario",
    "clientTypeLabel": "Arrendatario",

    "contractNumber": "843A",

    "propertyAddress": "Carrera 43A #5 Sur - 20",
    "tower": "3",
    "unit": "502",

    "category": "humedades_filtraciones",
    "categoryLabel": "Humedades y filtraciones",
    "subcategory": "Gotera activa",
    "description": "Gotera en el techo del baño desde hace tres días.",

    "attachments": [
      {
        "key": "entrantes/392bbd56-e696-4cf2-9e1f-985c18549622/99a680a7-0225-45a4-b38d-b3869eced4cf.jpg",
        "name": "416 wallpaper.jpg",
        "contentType": "image/jpeg",
        "size": 138006
      }
    ],
    "attachmentCount": 1,
    "attachmentPrefix": "entrantes/392bbd56-e696-4cf2-9e1f-985c18549622/",

    "availableDays": ["lun", "mie"],
    "availableDaysLabels": ["Lunes", "Miércoles"],
    "timeSlot": "manana",
    "timeSlotLabel": "En la mañana",
    "availabilityNotes": "Portería debe anunciar.",

    "entryAuthorization": true
  },
  "consent": {
    "accepted": true,
    "policyVersion": "2026-01",
    "acceptedAt": "2026-09-30T14:22:05.120Z",
    "ip": "181.x.x.x",
    "userAgent": "Mozilla/5.0 …"
  }
}
```

Notas sobre campos concretos:

- **`contractNumber`** es el identificador interno del contrato de arrendamiento, del
  estilo `843A`. Llega ya normalizado a mayúsculas y sin espacios. Puede ser `null`
  cuando quien reporta es un propietario con el inmueble desocupado.
- **`attachments`** puede venir vacío: los adjuntos son opcionales.
- **`attachmentPrefix`** es la carpeta exacta del bucket donde están esos archivos, o
  `null` si no hay ninguno.
- **`consent`** es la evidencia de la autorización de datos que exige la Ley 1581 de
  2012. **Hay que conservarla**, no es decorativa: es la prueba de que el titular
  autorizó el tratamiento.
- **`entryAuthorization`** confirma que el usuario autorizó la entrada del técnico a la
  vivienda.

## Lo que tiene que responder

```json
{ "ticket": "PQR-000123" }
```

El sitio muestra en pantalla exactamente esa cadena. Si la respuesta no trae `ticket`, el
sitio no falla: da el reporte por recibido y le dice al usuario que el número le llega por
correo. Pero entonces el usuario se queda sin número en pantalla, así que conviene
devolverlo siempre.

El sitio espera **10 segundos** como máximo y reintenta una vez. Si el flujo tarda más que
eso, conviene responder pronto con el radicado y hacer lo pesado —mover archivos, mandar
correos— después.

## El bucket de Cloudflare R2

R2 habla el protocolo **S3**, así que sirve el nodo de AWS S3 de n8n apuntando a un
endpoint propio, o peticiones HTTP firmadas.

- Endpoint: `https://<id-de-cuenta>.r2.cloudflarestorage.com`
- Región para la firma: `auto`
- Bucket: `inmobarco-maintenance`
- Credenciales: hay que crear un token de API de R2 **propio para n8n**, con permiso de
  lectura y escritura. No se reutiliza el del sitio: si alguno se ve comprometido se
  revoca solo ese.

### Cómo está organizado

Hay dos zonas y el flujo de n8n es el puente entre ellas.

**Zona 1 — la bandeja de entrada.** Es lo único que escribe el sitio:

```
entrantes/{submissionId}/{uuid}.jpg
```

Los nombres son UUID a propósito: el nombre que puso el usuario no se usa para construir
rutas —sería una vía para escribir donde no se debe— y además medio mundo sube
`IMG_0042.jpg`, que se pisarían entre sí. El nombre original viaja en el campo `name` de
cada adjunto.

**Zona 2 — el archivo.** Lo tiene que armar n8n:

```
mantenimientos/{contrato}/{aaaa-mm}-{radicado}/antes/01.jpg
mantenimientos/{contrato}/{aaaa-mm}-{radicado}/despues/01.jpg
mantenimientos/{contrato}/{aaaa-mm}-{radicado}/soportes/factura.pdf
mantenimientos/{contrato}/{aaaa-mm}-{radicado}/manifiesto.json
```

Ejemplo completo:
`mantenimientos/843A/2026-09-PQR-000123/antes/01.jpg`

El contrato va primero porque es lo que se busca —«qué ha pasado en este inmueble»— y la
fecha encabeza la carpeta del radicado para que, dentro de un contrato, el historial salga
ordenado con solo listarlo.

`antes/` son las fotos que subió el cliente al reportar. `despues/` y `soportes/` son de
la operación —fotos del técnico al cerrar, facturas, remisiones— y las escribe quien
atienda la orden, no este flujo.

## Lo que tiene que hacer el flujo

### 1. Asignar el radicado

Un consecutivo con estado real: `PQR-000123`, `PQR-000124`… Puede vivir en una hoja de
cálculo, en una base de datos o en el almacenamiento interno de n8n, pero tiene que ser
**único y persistente**.

Esto va primero porque todo lo demás depende de ello: la carpeta del archivo lleva el
radicado en el nombre. Mientras el webhook devuelva siempre el mismo número, todos los
reportes se archivan en la misma carpeta.

### 2. Verificar el número de contrato

**Este paso no se puede saltar.** El sitio comprueba que `contractNumber` tenga forma
válida y que no pueda salirse de una ruta, pero **no tiene forma de saber si el contrato
existe**. Si alguien escribe `834A` en vez de `843A`, y n8n lo usa tal cual como carpeta,
la evidencia de un arrendatario queda archivada bajo el contrato de otro, sin que nadie se
entere.

Así que: contrastarlo contra la lista real de contratos. Si no coincide con ninguno, o si
viene `null`, el reporte va a `mantenimientos/sin-contrato/…` y se marca para revisar a
mano.

### 3. Mover los adjuntos

Por cada elemento de `attachments`, dentro del bucket:

1. **Copiar** de `attachments[i].key` a
   `mantenimientos/{contrato}/{aaaa-mm}-{radicado}/antes/{NN}.{ext}`, donde `NN` es un
   consecutivo de dos dígitos dentro de la carpeta (`01`, `02`, …). La extensión se saca
   de la clave de origen.
2. **Borrar** el objeto original de `entrantes/`.

En S3 la copia se hace con `CopyObject`, que en una petición HTTP es un `PUT` al destino
con la cabecera `x-amz-copy-source: /{bucket}/{clave-origen}`. Los bytes no se descargan
ni se vuelven a subir: la copia ocurre dentro de Cloudflare.

Conviene renombrar a `01`, `02` en este paso: en la bandeja los nombres son UUID porque el
sitio no puede saber más, pero aquí ya se sabe el orden y quedan legibles.

### 4. Escribir el `manifiesto.json`

Un archivo en la carpeta del radicado con los datos del reporte: quién reportó, qué
inmueble, qué falla, cuándo, la disponibilidad, la evidencia de consentimiento y el nombre
original de cada archivo. Es lo que permite abrir una carpeta dentro de un año y entender
qué es sin tener que cruzarla contra ningún sistema.

### 5. Responder y notificar

Devolver `{ "ticket": "…" }` al sitio, y a partir de ahí lo que Inmobarco necesite: correo
al área de mantenimiento con las fotos adjuntas o enlazadas, aviso al cliente con su
radicado, registro en el CRM, mensaje de WhatsApp.

Para enlazar las fotos en un correo hacen falta URL firmadas de lectura, que se generan
con las mismas credenciales de R2 y con la caducidad que se quiera.

## Tres cosas que hay que tener en cuenta

**No crear todavía la regla de ciclo de vida de `entrantes/`.** El plan a futuro es que
esa carpeta se vacíe sola cada día, para recoger lo que alguien subió y luego abandonó el
formulario. Pero mientras este flujo no mueva los archivos, `entrantes/` es el **único**
sitio donde existen las evidencias: activar esa regla hoy borraría reportes reales al día
siguiente. Se crea después, y solo cuando el traslado esté probado.

**El orden importa.** El contador del radicado (paso 1) tiene que funcionar antes de
montar el traslado (paso 3), porque el radicado es parte de la ruta de destino.

**Los datos son sensibles.** El reporte trae nombre, cédula, dirección y teléfono, y las
fotos son del interior de la vivienda de alguien. Aplica la Ley 1581 de 2012: el campo
`consent` se conserva como prueba de la autorización, y los enlaces a las fotos no
deberían circular más allá de quien tiene que atender la orden.

## Lo que hay que tener a la mano antes de empezar

- Acceso a la instancia de n8n y al webhook `web-maintenance`.
- Credenciales de R2 para n8n (token de API con lectura y escritura sobre el bucket).
- El id de cuenta de Cloudflare, para armar el endpoint.
- La lista real de números de contrato, o una forma de consultarla, para el paso 2.
- Decidido dónde vive el consecutivo del radicado.
- Los destinatarios: a qué correo llega un reporte nuevo y qué se le responde al cliente.
