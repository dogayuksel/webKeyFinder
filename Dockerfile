# syntax=docker/dockerfile:1.4

# Build wasm module
FROM emscripten/emsdk AS fftw-builder

WORKDIR /usr/app/
COPY makefile .
RUN make fftw/.libs/libfftw3.a


# Build wasm module
FROM emscripten/emsdk AS wasm-builder

WORKDIR /usr/app/
COPY . .
COPY --from=fftw-builder --link /usr/app/fftw/ ./fftw/
RUN make libKeyFinder/build/libkeyfinder.a
RUN make dist/keyFinderProgressiveWorker.wasm


# Install production dependencies
FROM node:lts-alpine AS web-builder

WORKDIR /usr/app
RUN apk add --no-cache bash make
COPY --from=wasm-builder --link /usr/app .
RUN make release


# Install production dependencies
FROM node:lts-alpine AS prod-deps

WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile


FROM node:lts-alpine as runner

RUN addgroup -S -g 1001 runners
RUN adduser -S -u 1001 runner -G runners

WORKDIR /usr/app
COPY --from=prod-deps --link --chown=1001:1001 /usr/app/node_modules/ ./node_modules/
COPY --from=web-builder --link /usr/app/dist/ ./dist/

USER runner
CMD ["./node_modules/serve/bin/serve.js", "./dist", "-l", "3000", "-s"]
