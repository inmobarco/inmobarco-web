<template>
  <!-- Doble camino: quien busca vivienda y quien tiene un inmueble (§7.1, bloque 6) -->
  <section class="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="flex flex-col rounded-lg border border-line p-8 md:p-10">
        <h2 class="text-xl md:text-2xl">
          Estoy buscando dónde vivir
        </h2>
        <p class="mt-4 max-w-[46ch] flex-1 text-muted">
          Filtra por zona, presupuesto y número de habitaciones. Agendamos la visita contigo y
          te acompañamos hasta la firma del contrato.
        </p>
        <div class="mt-8">
          <BaseButton to="/arriendo">
            Ver inmuebles disponibles
          </BaseButton>
        </div>
      </div>

      <div class="flex flex-col rounded-lg bg-ink p-8 text-white md:p-10">
        <h2 class="text-xl text-white md:text-2xl">
          Tengo un inmueble
        </h2>
        <p class="mt-4 max-w-[46ch] flex-1 text-white/75">
          Nos encargamos de conseguir el arrendatario, estudiar su capacidad de pago, firmar el
          contrato y consignarte el canon cada mes.
        </p>
        <div class="mt-8">
          <BaseButton to="/propietarios">
            Consigna tu inmueble
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
