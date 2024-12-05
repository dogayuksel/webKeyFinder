{
  description = "webkeyfinder development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }@inputs:
    (flake-utils.lib.eachDefaultSystem
      (system: { formatter = nixpkgs.legacyPackages.${system}.nixpkgs-fmt; })) //
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
              # export EM_CACHE="~/em-cache"

              pkgs.nodePackages.nodejs
              pkgs.nodePackages.yarn
            ];
          };
      }
    ));
}
