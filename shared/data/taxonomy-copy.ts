import type { ListingCopy, OperationSlug } from './taxonomy'

/**
 * Textos de las páginas de listado (manual §9.3).
 *
 * Van aparte del diccionario porque son contenido, no estructura: se editan sin
 * tocar la lógica de rutas. Cada entrada está escrita a mano; no hay plantilla
 * con la variable cambiada, que es contenido duplicado.
 */

/** Listados raíz. */
export const BASE_COPY: Record<OperationSlug, ListingCopy> = {
  arriendo: {
    title: 'Inmuebles en arriendo en el Valle de Aburrá',
    description: 'Apartamentos, casas y locales en arriendo en Medellín, Envigado, Sabaneta, Itagüí y La Estrella. Te acompañamos desde la visita hasta la firma.',
    intro: 'Esto es todo lo que tenemos disponible para arrendar en el Valle de Aburrá. Puedes filtrar por municipio, tipo de inmueble, presupuesto y número de habitaciones; si prefieres, escríbenos por WhatsApp y acotamos la búsqueda contigo. Cada inmueble se entrega con inventario y contrato, y el acompañamiento sigue después de la firma.',
  },
  venta: {
    title: 'Inmuebles en venta en el Valle de Aburrá',
    description: 'Apartamentos y casas en venta en Envigado, Sabaneta, Itagüí y La Estrella. Acompañamiento en la negociación y en los trámites de la compra.',
    intro: 'Nuestro inventario en venta es más corto que el de arriendo y cambia con frecuencia, así que vale la pena revisarlo seguido. Si buscas algo puntual, cuéntanos qué necesitas y te avisamos cuando entre. Te acompañamos en la negociación y en los trámites hasta la escritura.',
  },
}

/** Copy por municipio, distinto para arriendo y para venta. */
export const ZONE_COPY: Record<string, ListingCopy> = {
  'arriendo/sabaneta': {
    title: 'Inmuebles en arriendo en Sabaneta',
    description: 'La mayor parte de nuestro inventario está en Sabaneta: apartamentos, apartaestudios y casas en arriendo. Consulta la disponibilidad.',
    intro: 'Sabaneta concentra la mayor parte de nuestro inventario. Es un municipio compacto, con mucha construcción residencial de los últimos años y estación en la línea A del metro, lo que lo volvió una opción frecuente para quien trabaja en Medellín pero prefiere vivir en el sur. Encontrarás sobre todo apartamentos, y de vez en cuando apartaestudios y casas.',
  },
  'arriendo/la-estrella': {
    title: 'Inmuebles en arriendo en La Estrella',
    description: 'Apartamentos y locales en arriendo en La Estrella, al sur del Valle de Aburrá, con proyectos residenciales recientes y estación de metro.',
    intro: 'La Estrella creció en los últimos años con proyectos residenciales nuevos, y buena parte de lo que administramos allí son apartamentos en esas unidades. Es el extremo sur de la línea A del metro, así que la conexión con Medellín es directa, y suele ofrecer más área por el mismo canon que los municipios vecinos.',
  },
  'arriendo/medellin': {
    title: 'Inmuebles en arriendo en Medellín',
    description: 'Apartamentos y locales comerciales en arriendo en Medellín. Mira lo que hay disponible en la ciudad y agenda tu visita.',
    intro: 'En Medellín manejamos un inventario más pequeño y más variado: apartamentos en sectores distintos y algunos locales comerciales. Si no ves lo que buscas en esta página, escríbenos; movemos inmuebles con frecuencia y podemos avisarte cuando entre algo del perfil que necesitas.',
  },
  'arriendo/itagui': {
    title: 'Inmuebles en arriendo en Itagüí',
    description: 'Apartamentos en arriendo en Itagüí, con buena conexión por metro y por vía con el resto del Valle de Aburrá.',
    intro: 'Itagüí combina zona residencial con actividad comercial e industrial, y está bien conectado por metro y por vía con el resto del valle. Lo que administramos allí son principalmente apartamentos. Es una opción práctica si trabajas en el sur y quieres acortar los desplazamientos diarios.',
  },
  'arriendo/envigado': {
    title: 'Inmuebles en arriendo en Envigado',
    description: 'Inmuebles en arriendo en Envigado, con estación de metro propia y a un paso de El Poblado. Consulta la disponibilidad actualizada.',
    intro: 'Envigado es de los municipios más buscados del sur del Valle de Aburrá: zona residencial consolidada, contigua a El Poblado y con estación propia en la línea A del metro. Lo que tenemos disponible allí se mueve rápido, así que si algo te interesa conviene agendar la visita pronto.',
  },
  'venta/sabaneta': {
    title: 'Inmuebles en venta en Sabaneta',
    description: 'Apartamentos en venta en Sabaneta. Te acompañamos en la negociación y en los trámites hasta la escritura.',
    intro: 'Sabaneta es donde más movimiento tenemos, también en venta. Aquí ves lo que está disponible hoy. Si compras para arrendar después, podemos contarte cómo se comporta el canon en el sector: es un dato que conocemos de primera mano por los inmuebles que ya administramos allí.',
  },
  'venta/la-estrella': {
    title: 'Inmuebles en venta en La Estrella',
    description: 'Apartamentos y casas en venta en La Estrella, al sur del Valle de Aburrá. Consulta la disponibilidad actual.',
    intro: 'La Estrella suele ofrecer un precio por metro más bajo que los municipios del centro del valle, y con la línea A del metro la conexión sigue siendo directa. Lo que tenemos en venta allí son apartamentos y, de vez en cuando, casas.',
  },
  'venta/medellin': {
    title: 'Inmuebles en venta en Medellín',
    description: 'Inmuebles en venta en Medellín. Escríbenos y te avisamos cuando entre algo que encaje con lo que buscas.',
    intro: 'Nuestro inventario en venta en Medellín es intermitente: entran y salen inmuebles según lo que nos confíen los propietarios. Si en este momento no hay nada publicado, déjanos saber qué buscas y te contactamos cuando aparezca.',
  },
  'venta/itagui': {
    title: 'Inmuebles en venta en Itagüí',
    description: 'Apartamentos en venta en Itagüí. Acompañamiento en la negociación, el avalúo y los trámites de la compra.',
    intro: 'En Itagüí vendemos sobre todo apartamentos. Si estás comparando municipios del sur, es de los que mejor sostiene la relación entre precio y conexión con el resto del valle. Te acompañamos en la negociación y en los trámites hasta la escritura.',
  },
  'venta/envigado': {
    title: 'Inmuebles en venta en Envigado',
    description: 'Apartamentos en venta en Envigado. Inventario corto y cambiante: escríbenos y te avisamos cuando entre algo que encaje.',
    intro: 'En Envigado vendemos bastante menos de lo que arrendamos, así que este listado es corto y cambia. Si buscas comprar en el municipio, cuéntanos el sector, el presupuesto y el número de habitaciones que necesitas, y te avisamos apenas entre algo que encaje.',
  },
}

/** Copy por tipo de inmueble, sin municipio. */
export const TYPE_COPY: Record<string, ListingCopy> = {
  'arriendo/apartamentos': {
    title: 'Apartamentos en arriendo en el Valle de Aburrá',
    description: 'Apartamentos en arriendo en Medellín, Envigado, Sabaneta, Itagüí y La Estrella. Filtra por zona, presupuesto y habitaciones.',
    intro: 'El apartamento es el grueso de lo que administramos: desde unidades de dos habitaciones hasta apartamentos familiares más amplios, casi siempre en unidades cerradas con portería. Filtra por municipio y presupuesto para ver solo lo que encaja con lo que buscas.',
  },
  'arriendo/casas': {
    title: 'Casas en arriendo en el Valle de Aburrá',
    description: 'Casas en arriendo en el sur del Valle de Aburrá. Inventario reducido y de alta rotación: consúltanos por lo que no esté publicado.',
    intro: 'Las casas son una porción pequeña de nuestro inventario y se arriendan rápido. Si no ves ninguna disponible ahora mismo, escríbenos: es el tipo de inmueble que más conviene buscar con anticipación, porque rara vez dura publicado más de unos días.',
  },
  'arriendo/locales': {
    title: 'Locales comerciales en arriendo',
    description: 'Locales comerciales en arriendo en Medellín y el sur del Valle de Aburrá. Consulta ubicación, área y canon.',
    intro: 'Los locales que administramos están sobre todo en zonas de paso y sectores comerciales consolidados. Si vas a montar negocio, cuéntanos la actividad y el área que necesitas: eso acota mucho la búsqueda y evita visitas que no llevan a nada.',
  },
  'arriendo/apartaestudios': {
    title: 'Apartaestudios en arriendo en el Valle de Aburrá',
    description: 'Apartaestudios en arriendo en el sur del Valle de Aburrá. Prácticos para vivir solo o por temporadas de trabajo.',
    intro: 'El apartaestudio funciona bien para quien vive solo o llega al valle por una temporada de trabajo. Son pocos y rotan rápido, así que si alguno de los publicados te sirve, conviene agendar la visita el mismo día.',
  },
}

/**
 * Combinaciones municipio + tipo. Solo están las que tienen inventario sostenido:
 * el resto existe como ruta, pero sale `noindex` hasta que se le escriba su texto.
 */
export const COMBO_COPY: Record<string, ListingCopy> = {
  'arriendo/sabaneta/apartamentos': {
    title: 'Apartamentos en arriendo en Sabaneta',
    description: 'La mayor oferta de nuestro inventario: apartamentos en arriendo en Sabaneta. Filtra por presupuesto y número de habitaciones.',
    intro: 'Es la combinación con más oferta de todo nuestro inventario. Encontrarás sobre todo apartamentos en unidades construidas en la última década, con zonas comunes y parqueadero. Usa los filtros de presupuesto y habitaciones para no tener que revisar la lista entera.',
  },
  'arriendo/la-estrella/apartamentos': {
    title: 'Apartamentos en arriendo en La Estrella',
    description: 'Apartamentos en arriendo en La Estrella, en proyectos residenciales recientes y con estación de metro cerca.',
    intro: 'Buena parte de estos apartamentos están en unidades nuevas construidas en los últimos años. Por lo general dan más área por el mismo canon que Sabaneta o Envigado, a cambio de quedar más al sur del valle.',
  },
  'arriendo/medellin/apartamentos': {
    title: 'Apartamentos en arriendo en Medellín',
    description: 'Apartamentos en arriendo en Medellín, en distintos sectores de la ciudad. Consulta la disponibilidad actual.',
    intro: 'En Medellín el inventario es más disperso: apartamentos en sectores distintos, sin un patrón único de área ni de canon. Conviene filtrar por presupuesto y por número de habitaciones para llegar rápido a lo que te sirve.',
  },
  'arriendo/itagui/apartamentos': {
    title: 'Apartamentos en arriendo en Itagüí',
    description: 'Apartamentos en arriendo en Itagüí, bien conectados por metro con el resto del Valle de Aburrá.',
    intro: 'Los apartamentos que administramos en Itagüí están en sectores residenciales con buena conexión hacia el metro y las vías principales. Suelen ser una alternativa a Sabaneta cuando el presupuesto es más ajustado.',
  },
  'arriendo/envigado/apartamentos': {
    title: 'Apartamentos en arriendo en Envigado',
    description: 'Apartamentos en arriendo en Envigado, con estación de metro y cercanía a El Poblado. Mira la disponibilidad.',
    intro: 'Casi todo lo que administramos en Envigado son apartamentos, en unidades residenciales con portería. Es un mercado con poca oferta disponible a la vez: si alguno te encaja, agenda la visita pronto, porque no suele durar muchos días publicado.',
  },
  'arriendo/la-estrella/locales': {
    title: 'Locales en arriendo en La Estrella',
    description: 'Locales comerciales en arriendo en La Estrella. Consulta área, ubicación y canon de lo disponible.',
    intro: 'La oferta de locales en La Estrella es puntual: uno o dos a la vez, según lo que nos confíen los propietarios. Si no hay nada publicado, cuéntanos qué actividad vas a montar y te avisamos cuando entre algo de ese perfil.',
  },
  'arriendo/medellin/locales': {
    title: 'Locales comerciales en arriendo en Medellín',
    description: 'Locales comerciales en arriendo en Medellín. Mira ubicación, área y canon de los que están disponibles.',
    intro: 'Los locales que manejamos en Medellín están en sectores con flujo peatonal o vehicular constante. Antes de visitar, revisa el área y la ubicación: son los dos datos que más determinan si un local funciona para tu negocio.',
  },
  'arriendo/sabaneta/casas': {
    title: 'Casas en arriendo en Sabaneta',
    description: 'Casas en arriendo en Sabaneta. Inventario reducido y de alta rotación: consúltanos por lo que no esté publicado.',
    intro: 'Las casas en Sabaneta son escasas y se arriendan rápido. Publicamos las que tenemos disponibles, pero si buscas específicamente casa en el municipio, lo más práctico es que nos dejes tus datos y te avisemos apenas entre una.',
  },
  'arriendo/sabaneta/apartaestudios': {
    title: 'Apartaestudios en arriendo en Sabaneta',
    description: 'Apartaestudios en arriendo en Sabaneta, prácticos para vivir solo o por temporadas de trabajo.',
    intro: 'Sabaneta es donde más apartaestudios manejamos, casi siempre en unidades con portería y zonas comunes. Funcionan bien para quien vive solo y quiere estar cerca del metro sin pagar el canon de un apartamento completo.',
  },
}
