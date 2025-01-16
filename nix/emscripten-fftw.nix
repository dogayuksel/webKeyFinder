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
}))
