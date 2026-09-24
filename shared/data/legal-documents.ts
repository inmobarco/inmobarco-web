import type { ContentSection } from './pages'
import { COMPANY, CONTACT, OPENING_HOURS } from './legal'

/**
 * Las cinco páginas legales del §6.1.
 *
 * Tres estados, no dos:
 *
 * - `pending`  — solo la estructura. Nadie ha escrito el texto.
 * - `draft`    — el texto está redactado pero **no lo ha revisado un abogado**.
 * - `published`— aprobado por Inmobarco. Es el único estado que indexa la página
 *                y que abre los formularios (§13).
 *
 * La distinción existe porque un borrador redactado por Claude a partir de la
 * política vigente **no es** un documento aprobado, y publicarlo como si lo fuera
 * sería exactamente el riesgo que el §13 trata de evitar.
 */

export type LegalStatus = 'pending' | 'draft' | 'published'

export interface LegalDocument {
  slug: string
  title: string
  description: string
  /** Versión que se envía como evidencia de consentimiento (§8.2). */
  version: string
  /** Fecha de última actualización, en ISO. Vacía mientras no esté aprobado. */
  updatedAt: string
  status: LegalStatus
  sections: ContentSection[]
}

const ADDRESS_LINE = `${COMPANY.address}, ${COMPANY.addressDetail}, ${COMPANY.city}`

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    // Texto vigente, transcrito de inmobarco.com/main-contenido-cat-6.htm el
    // 22-09-2026. No se reescribió ni se resumió: es un documento con efecto
    // jurídico y cualquier cambio de fondo lo decide Inmobarco.
    //
    // Sí se corrigieron los datos de contacto, que en la versión publicada están
    // desactualizados: dirección, teléfono y horario salen ahora de
    // `shared/data/legal.ts`, confirmados por Inmobarco el 22-09-2026.
    slug: 'tratamiento-de-datos',
    title: 'Política de tratamiento de datos personales',
    description: 'Política de tratamiento de datos personales de Inmobarco Inmobiliaria S.A.S., conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
    version: '2026-01',
    updatedAt: '2026-01-15',
    status: 'published',
    sections: [
      {
        heading: 'Responsable del tratamiento',
        body: [
          `INMOBARCO INMOBILIARIA S.A.S., identificada con NIT 901559457-0, con domicilio principal en Medellín, ${COMPANY.address}, ${COMPANY.addressDetail}, informa que, en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes, los datos personales que usted suministre en calidad de cliente, proveedor, empleado, visitante o cualquier otro vínculo legítimo con la empresa, serán recolectados, almacenados, usados, procesados, compartidos, actualizados y eventualmente eliminados, de acuerdo con los principios de legalidad, libertad, finalidad, veracidad, seguridad, acceso y confidencialidad.`,
        ],
      },
      {
        heading: 'Finalidad del tratamiento de datos personales',
        body: ['Los datos personales recolectados por INMOBARCO INMOBILIARIA S.A.S. tienen como finalidades principales, pero no limitadas a, las siguientes:'],
        groups: [
          {
            title: 'En el marco de relaciones contractuales o comerciales',
            bullets: [
              'Realizar procesos de afiliación, vinculación o contratación.',
              'Ejecutar correctamente contratos de arrendamiento, compraventa, administración de bienes inmuebles o cualquier otro negocio jurídico derivado del objeto social de la empresa.',
              'Gestionar cobros, pagos, facturación y trámites contables o tributarios.',
              'Comunicar cualquier tipo de novedad administrativa o contractual.',
              'Atender solicitudes, quejas, reclamos y peticiones.',
            ],
          },
          {
            title: 'Para gestión institucional y legal',
            bullets: [
              'Cumplir con obligaciones legales, regulatorias, judiciales o contractuales.',
              'Proteger la seguridad y los intereses legítimos de la empresa, sus clientes y terceros.',
              'Realizar auditorías internas o externas.',
            ],
          },
          {
            title: 'En el marco de actividades de marketing y servicio al cliente',
            bullets: [
              'Realizar encuestas de satisfacción y estudios de mercado.',
              'Enviar información publicitaria, promocional o informativa sobre nuestros servicios, novedades o beneficios.',
              'Gestionar bases de datos con fines estadísticos o de análisis comercial.',
            ],
          },
          {
            title: 'Para la protección y seguridad',
            bullets: [
              'Controlar el acceso físico y electrónico a las instalaciones.',
              'Garantizar la seguridad de las personas, bienes e información de la empresa.',
              'Monitorear por medio de cámaras de videovigilancia en instalaciones físicas.',
            ],
          },
        ],
      },
      {
        heading: 'Derechos del titular de los datos personales',
        body: ['Como titular de los datos personales, usted tiene los siguientes derechos:'],
        bullets: [
          'Conocer, actualizar y rectificar sus datos personales frente a INMOBARCO INMOBILIARIA S.A.S.',
          'Solicitar prueba de la autorización otorgada, salvo cuando no sea requerida por ley.',
          'Ser informado, previa solicitud, respecto del uso que se ha dado a sus datos personales.',
          'Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales. Esta revocatoria no procederá cuando exista un deber legal o contractual que lo impida.',
          'Acceder de forma gratuita a sus datos personales que hayan sido objeto de tratamiento.',
          'Presentar quejas ante la Superintendencia de Industria y Comercio cuando considere que han sido vulnerados sus derechos por parte de la empresa.',
          'Oponerse al tratamiento de datos, salvo en los casos legalmente establecidos.',
        ],
      },
      {
        heading: 'Deberes del titular de los datos personales',
        body: ['Los titulares también tienen deberes al suministrar su información:'],
        bullets: [
          'Suministrar información veraz y actualizada. Es responsabilidad del titular garantizar que los datos entregados sean exactos, completos y estén actualizados.',
          'Ejercer sus derechos de manera respetuosa y responsable, sin abuso ni mala fe.',
          'Informar oportunamente a INMOBARCO INMOBILIARIA S.A.S. sobre cambios o actualizaciones de su información personal.',
          'Abstenerse de suplantar a terceros o entregar información de otra persona sin autorización válida.',
        ],
      },
      {
        heading: 'Canales para ejercer sus derechos',
        body: ['Usted puede presentar peticiones, quejas o reclamos relacionados con la protección de datos a través de los siguientes medios:'],
        bullets: [
          `Correo electrónico: ${CONTACT.legal.email}`,
          `Dirección física: ${ADDRESS_LINE}`,
          `Teléfono: ${CONTACT.legal.phone}`,
          `Horario de atención: ${OPENING_HOURS.text}`,
        ],
      },
      {
        heading: 'Vigencia de la política',
        body: [
          'La presente política estará vigente por el tiempo que INMOBARCO INMOBILIARIA S.A.S. lleve a cabo las actividades relacionadas con las finalidades mencionadas.',
          'El tratamiento de los datos personales se realizará mientras subsista la relación comercial, contractual, legal o de cualquier otra índole con el titular de los datos. Una vez finalizada dicha relación, los datos serán conservados únicamente por el tiempo requerido para cumplir con las disposiciones legales y contractuales aplicables.',
          'Cualquier modificación sustancial a esta política será comunicada oportunamente a los titulares a través de medios físicos, electrónicos o digitales, según lo requiera el caso.',
        ],
      },
    ],
  },

  {
    // Redactado a partir de la política de tratamiento vigente: no hay aquí
    // ninguna afirmación que no esté ya en ese documento. Cubre el contenido
    // mínimo del artículo 15 del Decreto 1377 de 2013.
    // Aprobado por Inmobarco el 24-09-2026.
    slug: 'aviso-de-privacidad',
    title: 'Aviso de privacidad',
    description: 'Aviso de privacidad de Inmobarco Inmobiliaria S.A.S.: quién trata tus datos, con qué finalidad y qué derechos tienes.',
    version: '2026-09',
    updatedAt: '2026-09-24',
    status: 'published',
    sections: [
      {
        heading: 'Qué es este aviso',
        body: [
          'Este aviso resume cómo INMOBARCO INMOBILIARIA S.A.S. trata tus datos personales y se te presenta en el momento en que te los solicitamos. El detalle completo está en la Política de tratamiento de datos personales, que puedes consultar en este mismo sitio.',
        ],
      },
      {
        heading: 'Quién es el responsable',
        body: ['INMOBARCO INMOBILIARIA S.A.S., sociedad domiciliada en Medellín, Colombia.'],
        bullets: [
          `NIT: ${COMPANY.nit}`,
          `Dirección: ${ADDRESS_LINE}`,
          `Teléfono: ${CONTACT.legal.phone}`,
          `Correo electrónico: ${CONTACT.legal.email}`,
        ],
      },
      {
        heading: 'Para qué usamos tus datos',
        body: [
          'Tratamos tus datos personales para atender tu solicitud y para las finalidades previstas en nuestra Política de tratamiento de datos personales, que en resumen son:',
        ],
        bullets: [
          'Atender y dar respuesta a tus solicitudes, peticiones, quejas y reclamos.',
          'Gestionar y ejecutar contratos de arrendamiento, compraventa y administración de inmuebles, así como los trámites derivados de ellos.',
          'Cumplir las obligaciones legales, contractuales y tributarias que nos correspondan.',
          'Enviarte información sobre nuestros servicios, cuando lo hayas autorizado.',
          'Proteger la seguridad de las personas, los bienes y la información de la empresa.',
        ],
      },
      {
        heading: 'Qué derechos tienes',
        body: ['Como titular de los datos puedes, en cualquier momento:'],
        bullets: [
          'Conocer, actualizar y rectificar tus datos personales.',
          'Solicitar prueba de la autorización que nos otorgaste, salvo cuando la ley no la exija.',
          'Ser informado sobre el uso que les hemos dado.',
          'Revocar la autorización o pedir que suprimamos tus datos, cuando no exista un deber legal o contractual que lo impida.',
          'Acceder de forma gratuita a tus datos.',
          'Presentar quejas ante la Superintendencia de Industria y Comercio.',
        ],
      },
      {
        heading: 'Cómo ejercer tus derechos',
        body: [
          `Escríbenos a ${CONTACT.legal.email} o acércate a ${ADDRESS_LINE}. También puedes llamarnos al ${CONTACT.legal.phone} en horario de atención: ${OPENING_HOURS.text}`,
          'En la página de Habeas Data de este sitio encontrarás el detalle del procedimiento y de los plazos de respuesta.',
        ],
      },
      {
        heading: 'Dónde consultar la política completa',
        body: [
          'La Política de tratamiento de datos personales está publicada permanentemente en este sitio web, en la sección legal. Cualquier cambio sustancial se comunicará por medios físicos, electrónicos o digitales, según corresponda.',
        ],
      },
    ],
  },

  {
    // Recoge el funcionamiento real del sitio —inventario tomado de Wasi, pagos
    // y área de clientes en plataformas de terceros— y remite a la política de
    // datos en lo que le corresponde. Aprobado por Inmobarco el 24-09-2026.
    slug: 'terminos-y-condiciones',
    title: 'Términos y condiciones de uso',
    description: 'Condiciones de uso del sitio web de Inmobarco Inmobiliaria S.A.S.: alcance de la información publicada, propiedad intelectual y enlaces a terceros.',
    version: '2026-09',
    updatedAt: '2026-09-24',
    status: 'published',
    sections: [
      {
        heading: 'Objeto y aceptación',
        body: [
          'Estos términos regulan el uso del sitio web de INMOBARCO INMOBILIARIA S.A.S. Al navegarlo, aceptas lo aquí descrito. Si no estás de acuerdo con alguna de estas condiciones, te pedimos no usar el sitio.',
        ],
      },
      {
        heading: 'Uso del sitio',
        body: ['El sitio se ofrece para consultar nuestro inventario de inmuebles y para ponerte en contacto con nosotros. Al usarlo te comprometes a:'],
        bullets: [
          'Suministrar información veraz en los formularios.',
          'No utilizar el sitio con fines ilícitos ni contrarios a la buena fe.',
          'No intentar acceder a áreas restringidas, alterar su funcionamiento ni extraer masivamente su contenido por medios automatizados.',
          'No suplantar a otra persona ni entregar datos de terceros sin su autorización.',
        ],
      },
      {
        heading: 'Información sobre los inmuebles',
        body: [
          'La información de cada inmueble —precio, área, características y fotografías— proviene de nuestro sistema de gestión y se actualiza periódicamente. Procuramos que sea exacta, pero puede cambiar sin previo aviso y puede contener errores u omisiones.',
          'Lo publicado en este sitio tiene carácter informativo y no constituye oferta comercial vinculante. La disponibilidad de un inmueble, el valor definitivo del canon o del precio de venta y las condiciones del negocio se confirman por escrito antes de cualquier compromiso.',
          'Los valores se expresan en pesos colombianos. Salvo que se indique expresamente lo contrario, no incluyen la cuota de administración, los servicios públicos, los seguros ni los gastos de la operación.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        body: [
          'La marca, el logotipo, los textos, el diseño y demás elementos de este sitio pertenecen a INMOBARCO INMOBILIARIA S.A.S. o se usan con autorización de sus titulares. Puedes consultarlos y compartir enlaces, pero no reproducirlos, transformarlos ni explotarlos comercialmente sin autorización previa y escrita.',
          'Las fotografías de los inmuebles pertenecen a sus propietarios o a INMOBARCO INMOBILIARIA S.A.S. y no pueden usarse para publicar esos inmuebles en otros medios sin autorización.',
        ],
      },
      {
        heading: 'Enlaces a servicios de terceros',
        body: [
          'Este sitio enlaza a plataformas operadas por terceros, como la pasarela de pagos y el área de clientes. Esos servicios se rigen por sus propios términos y políticas de privacidad, y no están bajo nuestro control.',
          'INMOBARCO INMOBILIARIA S.A.S. no procesa pagos a través de este sitio web.',
        ],
      },
      {
        heading: 'Disponibilidad del servicio',
        body: [
          'Procuramos que el sitio esté disponible de forma continua, pero puede interrumpirse por mantenimiento, fallas técnicas o causas ajenas a nosotros. No garantizamos disponibilidad ininterrumpida ni asumimos responsabilidad por los perjuicios derivados de una interrupción.',
        ],
      },
      {
        heading: 'Tratamiento de datos personales',
        body: [
          'Los datos que nos entregues a través de este sitio se tratan conforme a nuestra Política de tratamiento de datos personales y al Aviso de privacidad, disponibles en la sección legal.',
        ],
      },
      {
        heading: 'Modificaciones',
        body: [
          'Podemos modificar estos términos cuando sea necesario. La versión vigente es siempre la publicada en esta página, con su fecha de actualización.',
        ],
      },
      {
        heading: 'Ley aplicable y jurisdicción',
        body: [
          'Estos términos se rigen por la ley colombiana. Cualquier controversia se someterá a los jueces de la República de Colombia.',
        ],
      },
    ],
  },

  {
    // Escrita sobre el comportamiento real del sitio, verificado: hoy no envía
    // ninguna cookie ni usa almacenamiento del navegador. Aprobada por Inmobarco
    // el 24-09-2026.
    //
    // ATENCIÓN: al activar la analítica (GA4) o Turnstile, esta página deja de
    // ser cierta. Hay que actualizarla **antes** de encender cualquiera de los dos.
    slug: 'politica-de-cookies',
    title: 'Política de cookies',
    description: 'Qué cookies usa el sitio de Inmobarco Inmobiliaria S.A.S. y cómo puedes gestionarlas.',
    version: '2026-09',
    updatedAt: '2026-09-24',
    status: 'published',
    sections: [
      {
        heading: 'Qué son las cookies',
        body: [
          'Una cookie es un archivo pequeño que un sitio web guarda en tu navegador para reconocerlo en visitas posteriores. Sirven para que el sitio funcione, para recordar preferencias o para medir cómo se usa.',
        ],
      },
      {
        heading: 'Qué cookies usa este sitio hoy',
        body: [
          'Actualmente este sitio no instala cookies en tu navegador ni guarda información en él. Puedes navegarlo, consultar inmuebles y escribirnos sin que quede ningún archivo almacenado en tu equipo por parte nuestra.',
          'Si esto cambia, actualizaremos esta página antes de activar cualquier cookie que no sea estrictamente necesaria y te pediremos tu consentimiento.',
        ],
      },
      {
        heading: 'Cookies que podremos usar más adelante',
        body: ['Tenemos previsto incorporar las siguientes categorías. Ninguna está activa en este momento:'],
        groups: [
          {
            title: 'Técnicas o necesarias',
            bullets: [
              'Permiten que el sitio funcione y que se recuerden tus preferencias de privacidad.',
              'No requieren consentimiento, porque sin ellas el sitio no puede prestarse.',
            ],
          },
          {
            title: 'Analíticas',
            bullets: [
              'Nos dirían cuántas personas visitan el sitio y qué secciones consultan, de forma agregada.',
              'Solo se activarán si das tu consentimiento, y podrás retirarlo cuando quieras.',
            ],
          },
          {
            title: 'De seguridad de terceros',
            bullets: [
              'Un servicio externo de verificación antispam puede instalar cookies al enviar un formulario, para distinguir a una persona de un programa automatizado.',
            ],
          },
        ],
      },
      {
        heading: 'Cómo gestionar tus preferencias',
        body: [
          'Cuando activemos cookies que requieran consentimiento, encontrarás en el sitio un panel para aceptarlas o rechazarlas y para cambiar de opinión después.',
          'Con independencia de ello, tu navegador te permite ver, bloquear y borrar las cookies de cualquier sitio. Ten en cuenta que bloquear las técnicas puede impedir que algunas funciones operen correctamente.',
        ],
      },
      {
        heading: 'Preguntas',
        body: [
          `Si tienes dudas sobre esta política, escríbenos a ${CONTACT.legal.email}.`,
        ],
      },
    ],
  },

  {
    // Los plazos citados son los de los artículos 14 y 15 de la Ley 1581 de 2012,
    // no compromisos propios: si Inmobarco quiere comprometerse a menos, hay que
    // decirlo explícitamente. Aprobado por Inmobarco el 24-09-2026.
    slug: 'habeas-data',
    title: 'Habeas Data',
    description: 'Cómo ejercer tu derecho de habeas data ante Inmobarco Inmobiliaria S.A.S.: qué puedes solicitar, por dónde y en cuánto tiempo respondemos.',
    version: '2026-09',
    updatedAt: '2026-09-24',
    status: 'published',
    sections: [
      {
        heading: 'En qué consiste',
        body: [
          'El habeas data es el derecho que tienes a conocer, actualizar, rectificar y suprimir la información que reposa sobre ti en nuestras bases de datos, y a revocar la autorización que nos diste para tratarla. Está reconocido en el artículo 15 de la Constitución Política y desarrollado por la Ley 1581 de 2012.',
        ],
      },
      {
        heading: 'Qué puedes solicitar',
        bullets: [
          'Consultar qué datos tuyos tenemos y con qué finalidad los usamos.',
          'Actualizar o corregir los que estén desactualizados, incompletos o sean inexactos.',
          'Solicitar prueba de la autorización que nos otorgaste.',
          'Revocar la autorización o pedir la supresión de tus datos, cuando no exista un deber legal o contractual que nos obligue a conservarlos.',
          'Presentar quejas si consideras que hemos incumplido la ley.',
        ],
      },
      {
        heading: 'Cómo presentar la solicitud',
        body: ['Puedes dirigirte a nosotros por cualquiera de estos medios:'],
        bullets: [
          `Correo electrónico: ${CONTACT.legal.email}`,
          `Dirección física: ${ADDRESS_LINE}`,
          `Teléfono: ${CONTACT.legal.phone}`,
          `Horario de atención: ${OPENING_HOURS.text}`,
        ],
      },
      {
        heading: 'Qué debe incluir tu solicitud',
        bullets: [
          'Tu nombre completo y número de documento de identidad.',
          'Una descripción clara de lo que solicitas.',
          'Un correo o dirección donde podamos responderte.',
          'Los documentos que quieras hacer valer, si los hay.',
        ],
        body: [
          'Si actúas en nombre de otra persona, necesitamos el documento que acredite tu representación.',
        ],
      },
      {
        heading: 'Plazos de respuesta',
        body: [
          'Los plazos son los que fija la Ley 1581 de 2012:',
        ],
        bullets: [
          'Consultas: se atienden en un término máximo de diez (10) días hábiles. Si no es posible atenderlas en ese plazo, te informaremos los motivos y la fecha en que se atenderá, que no superará los cinco (5) días hábiles siguientes al vencimiento del primer término.',
          'Reclamos: se atienden en un término máximo de quince (15) días hábiles contados desde el día siguiente a su recibo. Si no es posible atenderlos en ese plazo, te informaremos los motivos y la fecha en que se atenderá, que no superará los ocho (8) días hábiles siguientes al vencimiento del primer término.',
        ],
      },
      {
        heading: 'Si no quedas conforme',
        body: [
          'Puedes presentar una queja ante la Superintendencia de Industria y Comercio, que es la autoridad de protección de datos personales en Colombia. La ley exige haber agotado primero el trámite de consulta o reclamo ante nosotros.',
        ],
      },
    ],
  },
]

export function findLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find(document => document.slug === slug)
}

/**
 * Documentos sin los cuales no se puede pedir un dato personal a nadie.
 * El §13 lo pone como criterio de aceptación, no como recomendación.
 */
const REQUIRED_FOR_FORMS = ['tratamiento-de-datos', 'aviso-de-privacidad']

/**
 * ¿Se pueden publicar los formularios?
 *
 * Solo cuando los dos documentos de arriba estén **aprobados**. Un borrador no
 * cuenta: mientras el aviso de privacidad siga en `draft`, las páginas muestran
 * los canales de contacto en vez del formulario y la API los rechaza.
 */
export function formsArePublishable(): boolean {
  return REQUIRED_FOR_FORMS.every(slug => findLegalDocument(slug)?.status === 'published')
}
