<script setup lang="ts">
/**
 * Ilustración del valle del mockup, portada tal cual: cielo, tres cordilleras y
 * la silueta de la ciudad. Es SVG inline y no una foto, así que no pesa en el LCP
 * ni necesita imagen que nadie ha entregado todavía.
 */
const buildings = [
  { x: 20, y: 470, w: 74, h: 170 },
  { x: 104, y: 512, w: 58, h: 128 },
  { x: 172, y: 432, w: 86, h: 208 },
  { x: 268, y: 498, w: 66, h: 142 },
  { x: 344, y: 452, w: 78, h: 188 },
  { x: 432, y: 520, w: 60, h: 120 },
  { x: 502, y: 466, w: 92, h: 174 },
  { x: 604, y: 504, w: 64, h: 136 },
  { x: 678, y: 440, w: 82, h: 200 },
  { x: 770, y: 510, w: 70, h: 130 },
  { x: 850, y: 474, w: 88, h: 166 },
  { x: 948, y: 516, w: 58, h: 124 },
  { x: 1016, y: 448, w: 84, h: 192 },
  { x: 1110, y: 500, w: 68, h: 140 },
  { x: 1188, y: 462, w: 90, h: 178 },
  { x: 1288, y: 508, w: 62, h: 132 },
  { x: 1360, y: 478, w: 80, h: 162 },
]
</script>

<template>
  <svg
    class="absolute inset-0 h-full w-full"
    viewBox="0 0 1440 640"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F1FAFE" />
        <stop offset="55%" stop-color="#ECF9FE" />
        <stop offset="100%" stop-color="#D3F0FD" />
      </linearGradient>
      <pattern id="hero-win" width="17" height="24" patternUnits="userSpaceOnUse">
        <rect x="5" y="7" width="7" height="9" fill="#48BFF7" opacity=".5" />
      </pattern>
    </defs>

    <rect width="1440" height="640" fill="url(#hero-sky)" />

    <path
      d="M0,362 L120,300 L245,344 L370,258 L505,330 L645,248 L790,318 L930,266 L1075,326 L1205,272 L1330,330 L1440,296 L1440,640 L0,640 Z"
      fill="#A9E2FB"
      opacity=".75"
    />
    <path
      d="M0,416 L165,362 L305,404 L465,332 L610,394 L765,346 L910,402 L1065,356 L1210,408 L1350,360 L1440,392 L1440,640 L0,640 Z"
      fill="#7BD1F9"
      opacity=".7"
    />
    <path
      d="M0,486 L205,456 L405,482 L605,452 L825,488 L1045,458 L1265,484 L1440,466 L1440,640 L0,640 Z"
      fill="#1878AC"
      opacity=".22"
    />

    <g>
      <template v-for="building in buildings" :key="building.x">
        <rect :x="building.x" :y="building.y" :width="building.w" :height="building.h" fill="#141F21" />
        <rect :x="building.x" :y="building.y" :width="building.w" :height="building.h" fill="url(#hero-win)" />
      </template>
    </g>
  </svg>
</template>
