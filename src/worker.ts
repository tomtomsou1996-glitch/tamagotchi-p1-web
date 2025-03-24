import {
  readWasmStateFromIndexedDB,
  saveWasmStateToIndexedDB,
} from "./storageUtils";
import { default as TamaModule } from "./wasm/tama";

declare global {
  interface Window {
    saveToDB?: (data: number[]) => void;
  }
}

let module:
  | {
      _tama_wasm_init: () => void;
      _tama_wasm_save: () => void;
      _tama_wasm_set_value: (
        buffer: number,
        index: number,
        value: number
      ) => void;
      _tama_wasm_load: (buffer: number) => void;
      _tama_wasm_button: (button: number, pressed: number) => void;
      _tama_wasm_step: () => void;
      _malloc: (buffer: number) => number;
      _free: (buffer: number) => void;
    }
  | undefined;

const initGame = async () => {
  module = await TamaModule();
  if (module != null) {
    module._tama_wasm_init();
    console.log("WASM module initialized");

    await restoreFromDB();
  } else {
    console.error("Could not initialze WASM module");
  }
};

function pumpMessages() {
  for (let i = 0; i < 25; i++) {
    if (module != null) {
      module._tama_wasm_step();
    }
  }

  setTimeout(pumpMessages);
}

function autoSave() {
  if (module != null) {
    // This ends up calling self.saveToDB with the CPU state
    module._tama_wasm_save();
  }

  setTimeout(autoSave, 5000);
}

async function restoreFromDB() {
  if (module == null) {
    return;
  }

  const buffer = await readWasmStateFromIndexedDB();
  if (buffer == null) {
    return;
  }

  const cBuffer: number = module._malloc(buffer.length * 4);
  if (cBuffer) {
    for (let i = 0; i < buffer.length; i++) {
      module._tama_wasm_set_value(cBuffer, i, buffer[i]);
    }
    module._tama_wasm_load(cBuffer);
    module._free(cBuffer);
    console.log("Restored from IndexedDB");
  }
}

self.saveToDB = function (data: number[]) {
  saveWasmStateToIndexedDB(data)
    .then(() => {
      console.log("Saved to IndexedDB");
    })
    .catch((e: unknown) => {
      console.error("Error saving to IndexedDB: ", e);
    });
};

self.onmessage = function (e: {
  data: string | { button: string; pressed: boolean };
}) {
  if (e.data === "start") {
    console.log("Starting event loop");
    pumpMessages();
  } else if (e.data === "save") {
    if (module != null) {
      // This ends up calling self.saveToDB with the CPU state
      module._tama_wasm_save();
    }
  } else if (typeof e.data !== "string") {
    const { button, pressed } = e.data;
    console.log("Button: ", e.data);
    if (module != null) {
      module._tama_wasm_button(button.charCodeAt(0), pressed ? 1 : 0);
    }
  }
};

initGame().catch((e: unknown) => {
  console.error("Error initializing game: ", e);
});

autoSave();
