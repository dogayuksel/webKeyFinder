# Build wasm module
FROM emscripten/emsdk AS wasm-builder

WORKDIR /usr/app/
COPY . .
RUN make fftw/.libs/libfftw3.a
RUN make libKeyFinder/build/libkeyfinder.a
RUN make dist/keyFinderProgressiveWorker.wasm


# Install production dependencies
FROM node:lts-alpine AS web-builder

WORKDIR /usr/app
RUN apk add --no-cache bash make
COPY --from=wasm-builder /usr/app .
RUN make release


# Install production dependencies
FROM node:lts-alpine AS prod-deps

WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile


FROM node:lts-alpine as runner

RUN addgroup -g 1001 -S runners
RUN adduser -S runner -u 1001

WORKDIR /usr/app
COPY --from=prod-deps --chown=runner:runners /usr/app/node_modules/ ./node_modules/
COPY --from=web-builder /usr/app/dist/ ./dist/

USER runner
CMD ["./node_modules/serve/bin/serve.js", "./dist", "-l", "3000", "-s"]
