import { default as TamaModule } from "./wasm/tama";

const initGame = async () => {
    const module = await TamaModule();
    module._tama_wasm_init();
    module._tama_wasm_start();
}

initGame();