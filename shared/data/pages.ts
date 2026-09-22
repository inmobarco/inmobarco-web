/**
 * Contenido de las páginas institucionales.
 *
 * Todo lo que lleva `pending: true` es relleno estructural: la página existe,
 * se ve y se navega, pero sale `noindex` y avisa en pantalla de que el texto
 * está por llegar. Cuando Inmobarco entregue el contenido real se reemplaza el
 * texto y se pone `pending: false`; no hay que tocar ni una línea de código.
 *
 * El §16 prohíbe inventar cifras de trayectoria, testimonios y nombres de
 * aliados, así que ningún relleno afirma nada concreto sobre la empresa.
 */

import { OPENING_HOURS } from './legal'

export interface ContentSection {
  heading?: string
  /** Cada string es un párrafo. */
  body?: string[]
  /** Lista de puntos, si la sección los lleva. */
  bullets?: string[]
  /** Pares término + explicación: valores de la empresa, definiciones legales. */
  definitions?: { term: string, description: string }[]
  /** Subgrupos titulados con su propia lista, como las finalidades de la política. */
  groups?: { title: string, bullets: string[] }[]
}

export interface ContentPage {
  title: string
  /** Meta description. Mientras esté pendiente no se usa para indexar. */
  description: string
  intro?: string
  pending: boolean
  sections: ContentSection[]
}

/**
 * Texto entregado por Inmobarco el 22-09-2026. Se respeta su contenido; solo se
 * corrigió la puntuación necesaria para que cada valor se lea como término más
 * explicación.
 */
export const NOSOTROS: ContentPage = {
  title: 'Sobre Inmobarco',
  description: 'Somos una familia de profesionales dedicada al arrendamiento y la venta de inmuebles en el Valle de Aburrá. Conoce nuestra misión, visión y valores.',
  intro: 'Somos una familia compuesta por profesionales dedicados al trabajo arduo con espíritu de servicio.',
  pending: false,
  sections: [
    {
      heading: 'Quiénes somos',
      body: [
        'Somos una familia compuesta por profesionales dedicados al trabajo arduo con espíritu de servicio, educados con principios y valores, seguros de que con estas bases podemos garantizarles a nuestros aliados cumplimiento estricto de nuestras obligaciones, logrando encontrar tranquilidad para todos, comprometidos en satisfacer las necesidades de nuestros clientes y colaboradores con nuestras ofertas inmobiliarias de arrendamiento y venta de inmuebles de óptima calidad.',
      ],
    },
    {
      heading: 'Misión',
      body: [
        'En nuestra empresa, trabajamos para hacer realidad los sueños de nuestros clientes, proporcionando servicios inmobiliarios personalizados y de alta calidad. Nos enfocamos en escuchar, entender y ofrecer las mejores opciones del mercado, garantizando una experiencia satisfactoria en cada paso. Nos dedicamos a construir relaciones duraderas basadas en confianza y satisfacción.',
      ],
    },
    {
      heading: 'Visión',
      body: [
        'En 5 años, consolidarnos como líderes del sector inmobiliario, expandiendo nuestra presencia y ofreciendo un servicio que combine innovación, tecnología y un enfoque en la satisfacción total de nuestros clientes.',
      ],
    },
    {
      heading: 'Valores',
      definitions: [
        { term: 'Honestidad', description: 'Como personas siempre debemos decir la verdad, lo que nos lleva a construir lazos fuertes con nuestros clientes y aliados.' },
        { term: 'Tolerancia', description: 'Con nuestros semejantes, entendiendo que todos somos diferentes, únicos e irrepetibles.' },
        { term: 'Excelencia', description: 'Asumimos el compromiso de ser siempre los mejores, con actitud y buena disposición, promoviendo la alta calidad.' },
        { term: 'Calidad', description: 'Nos comprometemos con la excelencia, garantizando que los servicios ofrecidos sean siempre de la más alta calidad posible.' },
        { term: 'Responsabilidad social', description: 'Apoyamos iniciativas que contribuyan positivamente a la comunidad, reflejando la preocupación de la empresa por su entorno.' },
        { term: 'Ética y transparencia', description: 'Actuamos con integridad en todas las interacciones comerciales, garantizando la honestidad y la claridad en la comunicación con clientes y proveedores.' },
      ],
    },
  ],
}

export const ALIADOS: ContentPage = {
  title: 'Con quién trabajamos',
  description: 'Las compañías y entidades con las que Inmobarco trabaja para respaldar los contratos de arrendamiento.',
  pending: true,
  sections: [
    {
      heading: 'Nuestros aliados',
      body: ['Pendiente: qué aliados son reales, qué aporta cada uno a la operación y con qué logo se pueden publicar. El §16 no permite listar aliados sin confirmar.'],
    },
  ],
}

export const PROPIETARIOS: ContentPage = {
  title: 'Consigna tu inmueble',
  description: 'Entrega tu inmueble en administración a Inmobarco: buscamos el arrendatario, estudiamos su capacidad de pago y te consignamos el canon cada mes.',
  intro: 'Nos encargamos de conseguir el arrendatario, estudiar su capacidad de pago, firmar el contrato y consignarte el canon cada mes.',
  pending: true,
  sections: [
    {
      heading: 'Qué incluye la administración',
      body: ['Pendiente: el detalle exacto de qué cubre el servicio y qué no.'],
      bullets: [
        'Pendiente: porcentaje o valor de la comisión de administración.',
        'Pendiente: en cuántos días hábiles se consigna el canon.',
        'Pendiente: qué garantía o póliza respalda el contrato y quién la asume.',
        'Pendiente: cómo se reportan y se cobran los mantenimientos.',
      ],
    },
    {
      heading: 'Qué necesitas para empezar',
      body: ['Pendiente: documentos que debe aportar el propietario y tiempos del proceso.'],
    },
  ],
}

export const CONTACTO: ContentPage = {
  title: 'Contacto',
  description: 'Teléfono, correo y dirección de Inmobarco Inmobiliaria en Medellín. Escríbenos y te respondemos el mismo día hábil.',
  intro: 'Escríbenos por el canal que te quede más cómodo.',
  pending: false,
  sections: [
    {
      // Un solo sitio para el horario: `shared/data/legal.ts`. Así el pie, la
      // ficha del documento legal y esta página no pueden decir cosas distintas.
      heading: 'Horario de atención',
      body: [OPENING_HOURS.text],
    },
  ],
}

export const PQRS_PAGE: ContentPage = {
  title: 'Peticiones, quejas, reclamos y sugerencias',
  description: 'Radica una PQRS ante Inmobarco Inmobiliaria y conoce los plazos de respuesta.',
  intro: 'Toda petición, queja, reclamo o sugerencia queda radicada y con un responsable asignado.',
  pending: true,
  sections: [
    {
      heading: 'Plazos de respuesta',
      body: ['Pendiente: plazo comprometido de respuesta por tipo de solicitud, y el marco legal que aplica.'],
    },
    {
      heading: 'Cómo hacemos seguimiento',
      body: ['Pendiente: cómo se le informa al usuario el número de radicado y por dónde consulta el estado.'],
    },
  ],
}

/**
 * Índice de páginas de contenido con su ruta. Sirve para excluir del sitemap
 * las que siguen pendientes, sin mantener esa lista a mano en `nuxt.config`:
 * cuando una pasa a `pending: false`, entra al sitemap sola.
 */
export const CONTENT_PAGES: { path: string, content: ContentPage }[] = [
  { path: '/nosotros', content: NOSOTROS },
  { path: '/aliados', content: ALIADOS },
  { path: '/propietarios', content: PROPIETARIOS },
  { path: '/contacto', content: CONTACTO },
  { path: '/pqrs', content: PQRS_PAGE },
]

export interface FaqItem {
  question: string
  answer: string
  pending: boolean
}

export const FAQ: { page: ContentPage, items: FaqItem[] } = {
  page: {
    title: 'Preguntas frecuentes',
    description: 'Lo que más nos preguntan sobre arrendar, consignar un inmueble y la administración con Inmobarco.',
    pending: true,
    sections: [],
  },
  items: [
    { question: '¿Qué documentos necesito para arrendar?', answer: 'Pendiente: lista exacta de documentos que se le piden a un arrendatario y a su codeudor.', pending: true },
    { question: '¿Cómo agendo una visita?', answer: 'Pendiente: cómo se agenda, con cuánta anticipación y quién acompaña la visita.', pending: true },
    { question: '¿Cuánto cuesta el estudio del arrendatario y quién lo paga?', answer: 'Pendiente: valor del estudio y quién lo asume.', pending: true },
    { question: '¿Cuánto tarda la aprobación?', answer: 'Pendiente: tiempo habitual entre la solicitud y la aprobación.', pending: true },
    { question: '¿La administración está incluida en el canon?', answer: 'Pendiente: regla general sobre la cuota de administración y cómo se informa en cada inmueble.', pending: true },
    { question: '¿Cómo reporto un daño en el inmueble?', answer: 'Pendiente: canal de reporte de mantenimiento y tiempos de atención.', pending: true },
    { question: '¿Dónde pago el arriendo?', answer: 'Pendiente: confirmar que Palomma es el canal único y si existen alternativas.', pending: true },
    { question: '¿Qué comisión cobran por administrar mi inmueble?', answer: 'Pendiente: porcentaje de comisión y qué cubre.', pending: true },
  ],
}
