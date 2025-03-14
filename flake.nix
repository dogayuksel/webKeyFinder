{
  description = "webkeyfinder development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    let
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
            node ./src/rename-overridden-functions.mjs
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
            substituteInPlace packages/key-finder-web/src/Utils/keyFinderUtils.ts \
              --replace-fail "'key-finder-wasm?worker'" \
              "'../keyFinderProgressiveWorker.js?worker'"
          '';

          pnpmWorkspaces = [ "key-finder-web" ];
          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src pnpmWorkspaces;
            hash = "sha256-0t54141x/+mroxzzkxj641WSvCshUHFx83NoHNMGKOI=";
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
            em-fftw = pkgs.callPackage ./nix/emscripten-fftw.nix { };
            em-libkeyfinder = pkgs.callPackage ./nix/emscripten-keyfinder.nix
              { emscripten-fftw = em-fftw; };
            key-finder-wasm = pkgs.callPackage emscripten-key-finder-wasm
              { emscripten-fftw = em-fftw; emscripten-libkeyfinder = em-libkeyfinder; };
            key-finder-web = pkgs.callPackage key-finder-web-pkg
              { key-finder-wasm = key-finder-wasm; };
          };
        }
      )
    ) //
    {
      overlays.default =
        (final: prev:
          {
            inherit (self.packages.${final.system})
              em-fftw
              em-libkeyfinder
              key-finder-wasm
              key-finder-web;
          }
        );
    } //
    {
      nixosModules = {
        keyfinder = { config, pkgs, lib, ... }:
          with lib;
          let
            cfg = config.services.keyfinder;
          in
          {
            options.services.keyfinder = {
              enable = mkEnableOption "keyfinder";
              hostName = mkOption {
                type = types.str;
                description = "FQDN for the keyfinder instance.";
              };
            };
            config = mkIf cfg.enable {
              users.users.keyfinder = {
                isSystemUser = true;
                group = "nginx";
              };
              services.nginx = {
                enable = true;
                virtualHosts."${cfg.hostName}" = {
                  root = "${pkgs.key-finder-web}/dist";
                  locations."/" = {
                    tryFiles = "$uri $uri/ $uri.html /index.html";
                  };
                  locations."/assets" = {
                    extraConfig = "expires 1d;";
                  };
                };
              };
            };
          };
      };
    } //
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
