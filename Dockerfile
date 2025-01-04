# syntax=docker/dockerfile:1.11

# Build wasm module
FROM emscripten/emsdk AS wasm-builder

WORKDIR /usr/app/
COPY packages/key-finder-wasm .
RUN make release


# Build web
FROM node:lts-alpine AS web-builder

WORKDIR /usr/app
COPY packages ./packages
COPY --from=wasm-builder --link usr/app/dist packages/key-finder-wasm/dist
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable
RUN pnpm install --frozen-lockfile
RUN pnpm --filter key-finder-web build


FROM node:lts-alpine AS runner

RUN addgroup -g 1001 -S runners
RUN adduser -S runner -u 1001

WORKDIR /usr/app
RUN corepack enable
RUN pnpm init
RUN pnpm add serve
COPY --from=web-builder --chown=1001:1001 --link /usr/app/packages/key-finder-web/dist/ ./dist/

USER runner
CMD ["pnpm", "serve", "./dist", "-l", "3000", "-s"]
