<script setup lang="ts">
/**
 * Los cuatro puntos del §7.1, bloque 7. El texto describe lo que el manual
 * atribuye a Inmobarco y nada más: el mockup prometía cosas concretas —consignar
 * en cinco días hábiles, portal del propietario, firma electrónica— que nadie ha
 * confirmado, y una promesa comercial inventada es peor que una genérica.
 */
const values = [
  {
    title: 'El canon llega puntual',
    text: 'Cobramos, hacemos seguimiento a la mora y te consignamos el canon con su estado de cuenta, mes a mes.',
  },
  {
    title: 'Respaldo jurídico',
    text: 'Estudiamos a cada candidato antes de firmar y el contrato queda con las garantías que corresponden. Si hay que reclamar, no lo haces tú.',
  },
  {
    title: 'Mantenimiento con equipo propio',
    text: 'Un solo canal para reportar novedades. Coordinamos el arreglo, verificamos el trabajo y te contamos en qué quedó.',
  },
  {
    title: 'Inventarios que sí sirven',
    text: 'Inventario inicial y final con registro fotográfico, para que la entrega del inmueble no termine en discusión.',
  },
]
</script>

<template>
  <section class="bg-surface">
    <div class="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
      <h2 class="max-w-[24ch] text-2xl md:text-3xl">
        Por qué los propietarios nos entregan su inmueble
      </h2>

      <ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="value in values" :key="value.title">
          <span class="block h-1 w-12 rounded-full bg-primary" />
          <h3 class="mt-5 font-sans text-base font-semibold tracking-normal">
            {{ value.title }}
          </h3>
          <p class="mt-2 text-muted">
            {{ value.text }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
