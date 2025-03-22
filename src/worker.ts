import { default as TamaModule } from "./wasm/tama";

let module;

const initGame = async () => {
  module = await TamaModule();
  module._tama_wasm_init();
  console.log("WASM module initialized");
};

initGame();

function pumpMessages() {
  for (let i = 0; i < 10000; i++) {
    if (module != null) {
      module._tama_wasm_step();
    }
  }

  setTimeout(pumpMessages);
}

self.onmessage = function (e) {
  if (e.data === "start") {
    console.log("Starting event loop");
    pumpMessages();
  } else {
    const { button, pressed } = e.data;
    if (module != null) {
      module._tama_wasm_button(button.charCodeAt(0), pressed ? 1 : 0);
    }
  }
};
