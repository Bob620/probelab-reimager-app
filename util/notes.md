- Last compiled and ran on 16.13.2 (https://nodejs.org/dist/v16.13.2/)
- Windows build process expects CoreUtils (https://github.com/uutils/coreutils)
- Electron changed their headers repo to: https://atom.io/download/electron

Changed `node-canvas` to `napi-rs/canvas` (https://github.com/Brooooooklyn/canvas)
- This was because node-canvas uses NAN and not NAPI so it always had issues compiling for electron
- Not fully working for this repo but seems to work fine on the cli?
- 99% compatible API surface, just needed to change image importation and font registration
- No Mac build process yet

Canvas Notes
- need to compile `napi-rs/canvas` for electron, steps here: (https://github.com/alexcrichton/cc-rs#compile-time-requirements)
- Way the sourcer script does it is expecting NASM at `C:\Program Files\NASM` and MSYS2 at `C:\msys64` (https://www.nasm.us , https://www.msys2.org/)
- MSYS2 needs (at least for MSVC)
```
pacman -Sy pacman-mirrors
pacman -S make clang
```
- Downloads pre-compiled SKIA

Sharp Notes (https://sharp.pixelplumbing.com)
- **** sharp sometimes but its consistent at least


Thing to look into(?): https://www.npmjs.com/package/pngjs