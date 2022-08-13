# syntax=docker/dockerfile:1.4

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
COPY .pnp.cjs .pnp.loader.mjs .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

RUN yarn install --immutable --immutable-cache
RUN yarn workspace key-finder-web build:release


FROM node:lts-alpine as runner

RUN addgroup -g 1001 -S runners
RUN adduser -S runner -u 1001

WORKDIR /usr/app
RUN yarn add serve
COPY --from=web-builder --chown=1001:1001 --link /usr/app/packages/key-finder-web/dist/ ./dist/

USER runner
CMD ["yarn", "serve", "./dist", "-l", "3000", "-s"]
