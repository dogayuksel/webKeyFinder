{
  description = "webkeyfinder development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    let
      emscripten-fftw =
        { stdenv
        , fetchurl
        , emscripten
        , nodejs
        , perl
        }: (stdenv.mkDerivation (finalAttrs: {
          pname = "emscripten-fftw-double";
          version = "3.3.10";

          src = fetchurl {
            urls = [
              "https://fftw.org/fftw-${finalAttrs.version}.tar.gz"
              "ftp://ftp.fftw.org/pub/fftw/fftw-${finalAttrs.version}.tar.gz"
            ];
            sha256 = "sha256-VskyVJhSzdz6/as4ILAgDHdCZ1vpIXnlnmIVs0DiZGc=";
          };

          postPatch = ''
            substituteInPlace configure \
              --replace-fail "CFLAGS=\"\$CFLAGS -mtune=native\"" "CFLAGS=\"\$CFLAGS\""
          '';

          nativeBuildInputs = [ emscripten ];

          configureFlags = [
            "--disable-doc"
            "--disable-fortran"
            "--with-slow-timer"
          ];

          preConfigure = ''
            HOME=$TMPDIR
            mkdir -p .emscriptencache
            export EM_CACHE=$(pwd)/.emscriptencache
          '';

          configureScript = "emconfigure ./configure";

          buildPhase = ''
            emmake make;
          '';

          doCheck = true;
          nativeCheckInputs = [ nodejs perl ];
          checkPhase = ''
            echo "--- running check phase ---"

            printf '%s\n%s\n' "#!${nodejs}/bin/node" \
              "$(cat tests/bench)" > tests/bench
            chmod +x tests/bench

            perl -w ./tests/check.pl -r -c=1 -v ./tests/bench

            if [ $? -ne 0 ]; then
              echo "test has failed"
              exit 1;
            else
              echo "it seems to work"
            fi
          '';
        }));

      emscripten-libkeyfinder =
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
        }));

      emscripten-key-finder-wasm =
        { stdenv
        , emscripten
        , emscripten-fftw
        , emscripten-libkeyfinder
        , nodejs
        }:
        (stdenv.mkDerivation (finalAttrs: {
          pname = "key-finder-wasm";
          version = "0.0.1";

          src = builtins.path {
            path = ./packages/key-finder-wasm/.;
            name = "key-finder-wasm";
          };

          postPatch = ''
            substituteInPlace src/keyFinderProgressiveWorker.cpp \
              --replace-fail "#include \"../deps/libKeyFinder/src/keyfinder.h\"" \
              "#include \"keyfinder.h\""
          '';

          nativeBuildInputs = [
            emscripten
            nodejs
          ];

          dontConfigure = true;

          buildPhase = ''
            mkdir -p .emscriptencache
            export EM_CACHE=$(pwd)/.emscriptencache
            emcc -O3 -flto -v \
              -I ${emscripten-libkeyfinder}/include/keyfinder \
              -lembind ./src/keyFinderProgressiveWorker.cpp \
              ${emscripten-fftw}/lib/libfftw3.a \
              ${emscripten-libkeyfinder}/lib/libkeyfinder.a \
			        --post-js "./src/keyFinderProgressiveWorker.post.js" \
              -s "BUILD_AS_WORKER=1" \
            	-s "DISABLE_EXCEPTION_CATCHING=1" \
            	-s "ALLOW_MEMORY_GROWTH=1" \
            	-s "SINGLE_FILE=1" \
            	-o dist/keyFinderProgressiveWorker.js
            node ./src/rename-overridden-functions.mjs;
          '';

          installPhase = ''
            mkdir -p $out/bin
            cp dist/keyFinderProgressiveWorker.js $out/bin
          '';
        }));

      key-finder-web-pkg =
        { stdenvNoCC
        , nodejs
        , pnpm
        , key-finder-wasm
        , curl
        , xorg
        , liberation_ttf
        , ungoogled-chromium
        , cypress
        }: (stdenvNoCC.mkDerivation (finalAttrs: {
          pname = "key-finder-web";
          version = "0.0.1";

          src = builtins.path {
            path = ./.;
            name = "key-finder-web";
          };

          postPatch = ''
            substituteInPlace packages/key-finder-web/src/Utils/keyFinderUtils.js \
              --replace-fail "'omt:key-finder-wasm'" \
              "'omt:../keyFinderProgressiveWorker.js'"
          '';

          pnpmWorkspaces = [ "key-finder-web" ];
          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src pnpmWorkspaces;
            hash = "sha256-XJpEpa1Fxhnn1dI02LAhPzFq2AMug6UeWJwyAcaqQcc=";
          };

          nativeBuildInputs = [
            nodejs
            pnpm.configHook
          ];

          buildPhase = ''
            cp ${key-finder-wasm}/bin/keyFinderProgressiveWorker.js \
              ./packages/key-finder-web/src/
            pnpm build:web
          '';

          installPhase = ''
            mkdir -p $out
            cp -r ./packages/key-finder-web/dist $out
          '';

          doCheck = true;
          nativeCheckInputs = [
            curl
            xorg.xvfb
            liberation_ttf
            ungoogled-chromium
            cypress
          ];
          checkPhase = ''
            export CYPRESS_RUN_BINARY="${cypress}/bin/Cypress"
            pnpm serve > /dev/null 2>&1 & serverPID=$!

            until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
              printf '.'
              sleep 1
            done
            pnpm cypress run --browser chromium
            kill $serverPID
          '';
        }));

    in
    (flake-utils.lib.eachDefaultSystem
      (system: { formatter = nixpkgs.legacyPackages.${system}.nixpkgs-fmt; })) //
    (flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          packages = rec {
            fftw = pkgs.callPackage emscripten-fftw { };
            libkeyfinder = pkgs.callPackage emscripten-libkeyfinder
              { emscripten-fftw = fftw; };
            key-finder-wasm = pkgs.callPackage emscripten-key-finder-wasm
              { emscripten-fftw = fftw; emscripten-libkeyfinder = libkeyfinder; };
            key-finder-web = pkgs.callPackage key-finder-web-pkg
              { key-finder-wasm = key-finder-wasm; };
          };
        })
    ) //
    (flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default =
          pkgs.mkShell {
            packages = [
              pkgs.curl
              pkgs.gnutar
              pkgs.gnumake
              pkgs.cmake
              pkgs.emscripten

              pkgs.nodePackages.nodejs
              pkgs.corepack
              pkgs.nodePackages_latest.typescript
              pkgs.nodePackages_latest.typescript-language-server
              pkgs.nodePackages_latest.vscode-langservers-extracted
            ];

            shellHook = ''
              mkdir -p .emscriptencache
              export EM_CACHE=$(pwd)/.emscriptencache
            '';
          };
      }
    ));
}
