{ stdenv
, fetchFromGitHub
, emscripten
, cmake
, emscripten-fftw
, catch2_3
, lib
}:
(stdenv.mkDerivation (finalAttrs: {
  pname = "emscripten-libkeyfinder";
  version = "2.2.8";

  src = fetchFromGitHub {
    owner = "mixxxdj";
    repo = "libkeyfinder";
    rev = "941e517ebf853c2153a8b9d6efcc0c729199aa0b";
    hash = "sha256-cRrVOgFuPYfGeR+IjEMblESi/bdGUtnQHmvxDm1rp9A=";
    name = "libkeyfinder";
  };

  nativeBuildInputs = [
    emscripten
    cmake
    emscripten-fftw
    catch2_3
  ];

  patchPhase = ''
    cat >> tests/CMakeLists.txt << EOF
    set_target_properties(keyfinder-tests PROPERTIES COMPILE_FLAGS "-fwasm-exceptions ")
    set_target_properties(keyfinder-tests PROPERTIES LINK_FLAGS "-fwasm-exceptions ")
    EOF
  '';

  cmakeFlags = lib.mapAttrsToList lib.cmakeFeature {
    "FFTW3_LIBRARY" = "${emscripten-fftw}/lib/libfftw3.a";
    "FFTW3_INCLUDE_DIR" = "${emscripten-fftw}/include";
    "FETCHCONTENT_SOURCE_DIR_CATCH2" = "${catch2_3.src}";
    "CMAKE_FIND_USE_SYSTEM_PACKAGE_REGISTRY" = "OFF";
    "CMAKE_FIND_USE_PACKAGE_REGISTRY" = "OFF";
    "CMAKE_FIND_FRAMEWORK" = "LAST";
    "BUILD_SHARED_LIBS" = "0";
    "CMAKE_CXX_FLAGS_RELEASE" = "-O3";
    "CMAKE_BUILD_TYPE" = "RELEASE";
  };

  configurePhase = ''
    HOME=$TMPDIR
    mkdir -p .emscriptencache
    export EM_CACHE=$(pwd)/.emscriptencache
    mkdir -p build
    cd build
    emcmake cmake .. $cmakeFlags -DCMAKE_INSTALL_PREFIX=$out
  '';

  buildPhase = "emmake make";

  doCheck = true;
  checkPhase = "ctest";
}))
