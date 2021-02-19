
BUILD_CONFIG = -O1

all: build
.PHONY: all

release: BUILD_CONFIG = -O3 -flto
release: build
.PHONY: release

FFTW_URL = "http://www.fftw.org/fftw-3.3.8.tar.gz"

# source code for fftw
fftw/configure:
	@echo "fetching fftw"
	rm -rf fftw
	mkdir fftw
	curl ${FFTW_URL} --output fftw.tar.gz
	tar -zxvf fftw.tar.gz --directory fftw --strip-components=1
	rm fftw.tar.gz

# link fftw
fftw/.libs/libfftw3.a: fftw/configure
	@echo "building fftw"
	cd fftw; \
		emconfigure ./configure; \
		emmake make;


LIBKEYFINDER_URL = "https://github.com/mixxxdj/libKeyFinder.git"

# source code for libKeyFinder
libKeyFinder/CMakeLists.txt:
	@echo "fetching libKeyFinder"
	rm -rf libKeyFinder
	git clone ${LIBKEYFINDER_URL}

# link libKeyFinder
libKeyFinder/build/libkeyfinder.a: libKeyFinder/CMakeLists.txt fftw/.libs/libfftw3.a
	@echo "building libKeyFinder"
	cd libKeyFinder; \
		rm -rf build; mkdir build; \
		cd build; \
			emcmake cmake ..\
				-D FFTW3_LIBRARY="../../fftw/.libs/libfftw3.a" \
				-D FFTW3_INCLUDE_DIR="../../fftw/api" \
				-D CMAKE_CXX_FLAGS_RELEASE="-O3 -flto" \
				-D CMAKE_BUILD_TYPE="RELEASE" \
				-D BUILD_TESTING="false"; \
			emmake make;


node_modules: package.json
	@echo "install node modules"
	yarn


deps: fftw/.libs/libfftw3.a libKeyFinder/build/libkeyfinder.a node_modules
.PHONY: deps

clean_deps:
	rm -rf fftw
	rm -rf libKeyFinder
	rm -rf node_modules
.PHONY: clean_deps


EMCC_GENERATED_JS = src/web/keyFinderProgressiveWorker.js

$(EMCC_GENERATED_JS): \
			src/keyFinderApi/keyFinderProgressiveWorker.cpp \
			src/keyFinderApi/keyFinderProgressiveWorker.post.js \
			libKeyFinder/build/libkeyfinder.a fftw/.libs/libfftw3.a
	@echo "building web worker module"
	rm -f src/web/keyfinderProgressiveWorker.js \
				src/web/keyfinderProgressiveWorker.wasm
	emcc ${BUILD_CONFIG} \
			--bind src/keyFinderApi/keyFinderProgressiveWorker.cpp \
			libKeyFinder/build/libkeyfinder.a fftw/.libs/libfftw3.a \
			--post-js "src/keyFinderApi/keyFinderProgressiveWorker.post.js" \
			-s "BUILD_AS_WORKER=1" \
			-s "DISABLE_EXCEPTION_CATCHING=1" \
			-s "ALLOW_MEMORY_GROWTH=1" \
			-o src/web/keyFinderProgressiveWorker.js;
	node scripts/rename-overridden-functions.js;

dist/keyFinderProgressiveWorker.wasm: src/web/keyFinderProgressiveWorker.js
	mkdir -p dist
	cp src/web/keyFinderProgressiveWorker.wasm dist/keyFinderProgressiveWorker.wasm

JS_FILES := $(filter-out $(EMCC_GENERATED_JS), $(filter %.js %.ts %.tsx, $(shell find src/web -name '*')))

dist/index.js: $(JS_FILES) rollup.config.js node_modules src/web/keyFinderProgressiveWorker.js
	yarn build

dist/index.html: src/web/index.html
	mkdir -p dist
	cp src/web/index.html dist/index.html

dist/favicon.ico: src/web/favicon.ico
	mkdir -p dist
	cp src/web/favicon.ico dist/favicon.ico

build: dist/keyFinderProgressiveWorker.wasm \
			 dist/index.js \
			 dist/index.html \
			 dist/favicon.ico
.PHONY: build

serve:
	yarn serve
.PHONY: serve

clean:
	rm -rf dist
	rm -f src/web/keyFinderProgressiveWorker.js
.PHONY: clean
