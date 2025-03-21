import { useEffect, useState } from "react";
import TamaWorker from './worker?worker'
import Screen from './Screen';
import "./App.css";

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
