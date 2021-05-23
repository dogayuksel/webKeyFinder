FROM emscripten/emsdk

WORKDIR /usr/app/

COPY . .

RUN make fftw/.libs/libfftw3.a

RUN make libKeyFinder/build/libkeyfinder.a

RUN make dist/keyFinderProgressiveWorker.wasm


FROM node:14-alpine3.13

WORKDIR /usr/app

COPY --from=0 /usr/app .

RUN apk add --no-cache bash make

RUN make release

CMD ["make", "serve"]
