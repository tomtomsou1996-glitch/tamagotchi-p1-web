import {
  loadWasmStateFromIndexedDB,
  saveWasmStateToIndexedDB,
} from "./storageUtils";
import { default as TamaModule } from "./wasm/tama";

let module;

const initGame = async () => {
  module = await TamaModule();
  module._tama_wasm_init();
  console.log("WASM module initialized");
};

initGame();

function pumpMessages() {
  for (let i = 0; i < 25; i++) {
    if (module != null) {
      module._tama_wasm_step();
    }
  }

  setTimeout(pumpMessages);
}

self.onmessage = async function (e: {
  data: string | { button: string; pressed: boolean };
}) {
  if (e.data === "start") {
    console.log("Starting event loop");
    pumpMessages();
  } else if (e.data === "load") {
    await loadWasmStateFromIndexedDB(module);
  } else if (e.data === "save") {
    await saveWasmStateToIndexedDB(module);
  } else if (typeof e.data !== "string") {
    const { button, pressed } = e.data;
    if (module != null) {
      module._tama_wasm_button(button.charCodeAt(0), pressed ? 1 : 0);
    }
  }
};
