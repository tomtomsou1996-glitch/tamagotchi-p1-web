import "./App.css";

import { useEffect, useState } from "react";

import Screen from './Screen';
import TamaWorker from './worker?worker'

let worker;

export const SCREEN_WIDTH = 32;

function App() {
  const [screenMatrix, setScreenMatrix] = useState<number[] | undefined>();

  useEffect(() => {
    if (worker == null) {
      worker = new TamaWorker();
      worker.addEventListener("message", ({ data }) => {
        setScreenMatrix(data);
      })
    }
  }, []);

  return (
    <>
      {screenMatrix &&
        <Screen
          matrix={screenMatrix} />}
    </>
  );
}

export default App;
