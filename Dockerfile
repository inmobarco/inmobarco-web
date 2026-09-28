# Manual §12: preset node-server tras Traefik. Sin nginx en el host.
#
# Dos etapas: la primera compila con todas las dependencias, la segunda solo
# lleva `.output`, que es autocontenido. La imagen final no tiene ni el código
# fuente ni node_modules.

FROM node:22-alpine AS build
WORKDIR /app

# Sin esto, corepack pide confirmación por consola para descargar pnpm y el
# build se queda colgado: en Docker no hay nadie para responder que sí.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# La versión de pnpm sale del campo `packageManager` de package.json.
RUN corepack enable

# Las dependencias se copian aparte del código: mientras el lockfile no cambie,
# Docker reutiliza esta capa y el build tarda segundos en vez de minutos.
#
# `pnpm-workspace.yaml` es obligatorio aquí: lleva el `allowBuilds` con el que
# pnpm 12 autoriza los scripts de instalación de sharp, esbuild y oxide. Sin él,
# la instalación se detiene con ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# El build no necesita credenciales de Wasi: las páginas que se generan aquí son
# contenido estático. La home, los listados y las fichas se renderizan en
# caliente con SWR, ya en el servidor y con las variables del entorno.
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

COPY --from=build /app/.output ./.output

# Nada aquí necesita root.
USER node

EXPOSE 3000

# Salud: /api/health responde 200 sin tocar Wasi, así que un corte de la API
# externa no hace que Swarm reinicie el contenedor en bucle.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
