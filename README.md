# Tamagotchi P1 for Web

This is an emulator for [Tamagotchi P1](<https://tamagotchi.fandom.com/wiki/Tamagotchi_(1996_Pet)>) that runs in web browsers.

![Feeding](static/feed.gif?raw=true)

| A neglected Tamagotchi                                   | ...who deserved better                 |
| -------------------------------------------------------- | -------------------------------------- |
| ![A neglected Tamagotchi](static/neglected.png?raw=true) | ![An angel](static/angel.png?raw=true) |

It supports:

- Load/save
- Sound
- Interaction via buttons

## Architecture

### Web Worker

- [TamaLIB - A hardware agnostic first-gen Tamagotchi emulation library](https://github.com/jcrona/tamalib/) compiled to WASM
- [`wasm/tama.c`](src/wasm/tama.c) (also compiled to WASM): a HAL to run TamaLIB and send game state updates to the UI (via `postMessage`)
- [`worker.ts`](src/worker.ts)
  - Loading the WASM module
  - Persistence to IndexedDB
  - Syncing the UI's button states to the emulated hardware
  - Game loop

### UI

- Rendering UI and sound updates posted from Web Worker
- Triggering Web Worker to handle button clicks and load/save commands
- Muting/unmuting

## Getting started

### Prerequisites

- You need to install `emsdk`. Follow [their guide](https://emscripten.org/docs/getting_started/downloads.html#installation-instructions-using-the-emsdk-recommended) for more info.
- You need to locate a copy of the Tamagotchi P1 ROM. I cannot tell you how to get it. Put it under [`wasm` folder](src/wasm) as `tama.b`. It should have the following hashes:
  > ```
  > MD5:  3fce172403c27274e59723bbb9f6d8e9
  > SHA1: 4b4979cf92dc9d2fb6d7295a38f209f3da144f72
  > ```

### Run

Run `npm run dev` to start the game locally. You can also run `npm run wasm` to compile only the WASM parts.

> NOTE: Saving files under the [`wasm` folder](src/wasm) will trigger a hot reload of the UI, but won't actually rebuild and reload the WASM module. You need to restart the entire app to pick up changes made to the C code.

## Why?

- This is a good project to learn about WebAssembly in JavaScript with.
- While there are Tamagotchi P1 emulators for real hardware (and learn a lot by [reading](https://github.com/ericlewis/playdate-tamagotchi) [their](https://github.com/GaryZ88/ArduinoGotchi) [code](https://github.com/GMMan/flipperzero-tamagotch-p1), thanks!), I didn't find any web-based options.

![Screencast](static/initial.gif?raw=true)
