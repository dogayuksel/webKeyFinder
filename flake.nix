{
  description = "webkeyfinder development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }@inputs:
    let
      fftw = system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        (pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = "emscripten-fftw-double";
          version = "3.3.10";

          src = pkgs.fetchurl {
            urls = [
              "https://fftw.org/fftw-${finalAttrs.version}.tar.gz"
              "ftp://ftp.fftw.org/pub/fftw/fftw-${finalAttrs.version}.tar.gz"
            ];
            sha256 = "sha256-VskyVJhSzdz6/as4ILAgDHdCZ1vpIXnlnmIVs0DiZGc=";
          };

          outputs = [ "out" ];

          buildInputs = [ pkgs.emscripten ];

          configureFlags = [ "--disable-doc" "--disable-fortran" ];
          configurePhase = ''
            HOME=$TMPDIR
            mkdir -p .emscriptencache
            export EM_CACHE=$(pwd)/.emscriptencache
            emconfigure ./configure
          '';

          postPatch = ''
            substituteInPlace configure \
              --replace-fail "CFLAGS=\"\$CFLAGS -mtune=native\"" "CFLAGS=\"\$CFLAGS\""
          '';

          buildPhase = ''
            HOME=$TMPDIR
            emmake make;
          '';

          installPhase = ''
            mkdir -p $out/share
            cp .libs/libfftw3.a $out/share
          '';
        }));

    in
    (flake-utils.lib.eachDefaultSystem
      (system: { formatter = nixpkgs.legacyPackages.${system}.nixpkgs-fmt; })) //
    (flake-utils.lib.eachDefaultSystem
      (system: {
        packages = { fftw = fftw system; };
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
              pkgs.nodePackages.yarn
            ];
          };
      }
    ));
}
