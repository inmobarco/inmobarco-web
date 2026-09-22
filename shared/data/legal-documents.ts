import type { ContentSection } from './pages'
import { COMPANY, CONTACT, OPENING_HOURS } from './legal'

/**
 * Las cinco páginas legales del §6.1.
 *
 * Son documentos con efecto jurídico, así que aquí no hay texto redactado: solo
 * la estructura que cada uno debe tener, para que Inmobarco o su abogado peguen
 * el contenido. Mientras `pending` sea `true` la página se ve, se navega y se
 * enlaza, pero sale `noindex` y avisa de que el texto no es el definitivo.
 *
 * Recordatorio del §13: **ningún formulario puede salir a producción antes de que
 * la política de tratamiento y el aviso de privacidad estén publicados de verdad.**
 */

export interface LegalDocument {
  slug: string
  title: string
  description: string
  /** Versión que se envía como evidencia de consentimiento (§8.2). */
  version: string
  /** Fecha de última actualización, en ISO. Vacía mientras esté pendiente. */
  updatedAt: string
  pending: boolean
  sections: ContentSection[]
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    // Texto vigente, transcrito de inmobarco.com/main-contenido-cat-6.htm el
    // 22-09-2026. No se reescribió ni se resumió: es un documento con efecto
    // jurídico y cualquier cambio de fondo lo decide Inmobarco.
    //
    // Sí se corrigieron los datos de contacto, que en la versión publicada están
    // desactualizados: dirección, teléfono y horario salen ahora de
    // `shared/data/legal.ts`, confirmados por Inmobarco el 22-09-2026. Conviene
    // actualizar también el documento del sitio viejo para que no queden dos
    // versiones distintas circulando.
    slug: 'tratamiento-de-datos',
    title: 'Política de tratamiento de datos personales',
    description: 'Política de tratamiento de datos personales de Inmobarco Inmobiliaria S.A.S., conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
    version: '2026-01',
    updatedAt: '2026-01-15',
    pending: false,
    sections: [
      {
        heading: 'Responsable del tratamiento',
        body: [
          'INMOBARCO INMOBILIARIA S.A.S., identificada con NIT 901559457-0, con domicilio principal en Medellín, Carrera 47B #17B Sur – 25, Local 102, Edificio Fuente Azul, Santa María de los Ángeles, informa que, en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes, los datos personales que usted suministre en calidad de cliente, proveedor, empleado, visitante o cualquier otro vínculo legítimo con la empresa, serán recolectados, almacenados, usados, procesados, compartidos, actualizados y eventualmente eliminados, de acuerdo con los principios de legalidad, libertad, finalidad, veracidad, seguridad, acceso y confidencialidad.',
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
          `Dirección física: ${COMPANY.address}, ${COMPANY.addressDetail}, ${COMPANY.city}`,
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
    slug: 'aviso-de-privacidad',
    title: 'Aviso de privacidad',
    description: 'Aviso de privacidad de Inmobarco Inmobiliaria S.A.S. sobre el tratamiento de datos personales.',
    version: '2026-09',
    updatedAt: '',
    pending: true,
    sections: [
      { heading: 'Identificación del responsable', body: ['Pendiente.'] },
      { heading: 'Tratamiento al que serán sometidos los datos', body: ['Pendiente: descripción resumida del tratamiento y su finalidad.'] },
      { heading: 'Derechos del titular', body: ['Pendiente.'] },
      { heading: 'Dónde consultar la política completa', body: ['Pendiente: remisión a la política de tratamiento de datos.'] },
    ],
  },
  {
    slug: 'terminos-y-condiciones',
    title: 'Términos y condiciones de uso',
    description: 'Condiciones de uso del sitio web de Inmobarco Inmobiliaria S.A.S.',
    version: '2026-09',
    updatedAt: '',
    pending: true,
    sections: [
      { heading: 'Objeto', body: ['Pendiente: qué regula este documento y a quién aplica.'] },
      { heading: 'Uso del sitio', body: ['Pendiente: usos permitidos y prohibidos.'] },
      { heading: 'Información de los inmuebles', body: ['Pendiente: alcance y vigencia de la información publicada, y que no constituye oferta comercial vinculante.'] },
      { heading: 'Propiedad intelectual', body: ['Pendiente: titularidad de marca, textos y fotografías.'] },
      { heading: 'Enlaces a sitios de terceros', body: ['Pendiente: mención de la pasarela de pagos y del área de clientes como servicios externos.'] },
      { heading: 'Ley aplicable', body: ['Pendiente: legislación y jurisdicción.'] },
    ],
  },
  {
    slug: 'politica-de-cookies',
    title: 'Política de cookies',
    description: 'Qué cookies usa el sitio de Inmobarco Inmobiliaria S.A.S. y cómo gestionarlas.',
    version: '2026-09',
    updatedAt: '',
    pending: true,
    sections: [
      { heading: 'Qué son las cookies', body: ['Pendiente.'] },
      { heading: 'Cookies que usamos', body: ['Pendiente: inventario real de cookies, incluidas las de analítica, con su finalidad y duración.'] },
      { heading: 'Cómo gestionar tus preferencias', body: ['Pendiente: cómo se cambia el consentimiento desde el sitio y desde el navegador.'] },
    ],
  },
  {
    slug: 'habeas-data',
    title: 'Habeas Data',
    description: 'Cómo ejercer el derecho de habeas data ante Inmobarco Inmobiliaria S.A.S.',
    version: '2026-09',
    updatedAt: '',
    pending: true,
    sections: [
      { heading: 'En qué consiste', body: ['Pendiente: alcance del derecho según la Ley 1581 de 2012.'] },
      { heading: 'Cómo presentar una solicitud', body: ['Pendiente: canal, datos que debe incluir la solicitud y plazos de respuesta.'] },
      { heading: 'Reclamación ante la autoridad', body: ['Pendiente: cuándo se puede acudir a la Superintendencia de Industria y Comercio.'] },
    ],
  },
]

export function findLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find(document => document.slug === slug)
}
