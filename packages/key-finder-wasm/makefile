
BUILD_CONFIG = -O1

all: build
.PHONY: all

release: BUILD_CONFIG = -O3 -flto
release: build
.PHONY: release

FFTW_URL = "http://www.fftw.org/fftw-3.3.10.tar.gz"

# source code for fftw
deps/fftw/configure:
	@echo "fetching fftw"
	rm -rf deps/fftw
	mkdir -p deps/fftw
	cd deps; \
		curl ${FFTW_URL} --output fftw.tar.gz; \
		tar -zxvf fftw.tar.gz --directory fftw --strip-components=1; \
		rm fftw.tar.gz;

# link fftw
deps/fftw/.libs/libfftw3.a: deps/fftw/configure
	@echo "building fftw"
	cd deps/fftw; \
		emconfigure ./configure; \
		emmake make;


LIBKEYFINDER_URL = "https://github.com/mixxxdj/libKeyFinder.git"

# source code for libKeyFinder
deps/libKeyFinder/CMakeLists.txt:
	@echo "fetching libKeyFinder"
	rm -rf deps/libKeyFinder
	mkdir -p deps
	cd deps; \
		git clone ${LIBKEYFINDER_URL}

# link libKeyFinder
deps/libKeyFinder/build/libkeyfinder.a: deps/libKeyFinder/CMakeLists.txt deps/fftw/.libs/libfftw3.a
	@echo "building libKeyFinder"
	cd deps/libKeyFinder; \
		rm -rf build; mkdir build; \
		cd build; \
			emcmake cmake ..\
				-D FFTW3_LIBRARY="../../fftw/.libs/libfftw3.a" \
				-D FFTW3_INCLUDE_DIR="../../fftw/api" \
				-D CMAKE_CXX_FLAGS_RELEASE="-O3 -flto" \
				-D CMAKE_BUILD_TYPE="RELEASE" \
				-D BUILD_TESTING="false"; \
			emmake make;


deps: deps/fftw/.libs/libfftw3.a deps/libKeyFinder/build/libkeyfinder.a
.PHONY: deps

clean_deps:
	rm -rf deps
.PHONY: clean_deps


EMCC_GENERATED_JS = dist/keyFinderProgressiveWorker.js

$(EMCC_GENERATED_JS): \
			src/keyFinderProgressiveWorker.cpp \
			src/keyFinderProgressiveWorker.post.js \
			deps/libKeyFinder/build/libkeyfinder.a deps/fftw/.libs/libfftw3.a
	@echo "building web worker module"
	rm -rf dist; mkdir dist
	emcc ${BUILD_CONFIG} \
			--bind src/keyFinderProgressiveWorker.cpp \
			deps/libKeyFinder/build/libkeyfinder.a deps/fftw/.libs/libfftw3.a \
			--post-js "src/keyFinderProgressiveWorker.post.js" \
			-s "BUILD_AS_WORKER=1" \
			-s "DISABLE_EXCEPTION_CATCHING=1" \
			-s "ALLOW_MEMORY_GROWTH=1" \
			-s "SINGLE_FILE=1" \
			-o dist/keyFinderProgressiveWorker.js;
	node src/rename-overridden-functions.mjs;

build: dist/keyFinderProgressiveWorker.js
.PHONY: build

clean:
	rm -rf dist
.PHONY: clean
