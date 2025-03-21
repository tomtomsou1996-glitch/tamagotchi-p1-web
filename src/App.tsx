import { useEffect } from "react";

import "./App.css";

import { default as TamaModule } from "./wasm/tama.js";

function App() {
  useEffect(() => {
    const loadModule = async () => {
      const module = await (await TamaModule()).ready;
      module._tama_wasm_init();
    }

    loadModule();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button
        type="button"
        className={`
          group text inline-block overflow-hidden rounded-full bg-green-300/30
          px-7 py-1.5 text-sm font-semibold text-green-700/70
          transition-transform
          hover:bg-green-500/70 hover:text-white
        `}
      >
        <span
          data-before="Send message"
          className={`
            relative inline-block py-1.5 transition-transform
            group-hover:-translate-y-full
            before:absolute before:top-full before:py-1.5
            before:content-[attr(data-before)]
          `}
        >
          Send message
        </span>
      </button>
    </>
  );
}

export default App;
