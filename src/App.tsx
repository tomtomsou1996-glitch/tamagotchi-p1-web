import "./App.css";

import { useEffect, useState } from "react";

import Button from "./Button";
import IconBar from "./IconBar";
import Screen from "./Screen";
import TamaWorker from "./worker?worker";

let worker;

export const SCREEN_WIDTH = 32;

// todo
// * icons
// * audio
// * save

function postMessageToWorker(data) {
  if (worker != null) {
    console.log("Posting message to worker: ", data);
    worker.postMessage(data);
  }
}

function App() {
  const [screenMatrix, setScreenMatrix] = useState<number[] | undefined>();
  const [icons, setIcons] = useState<boolean[]>(new Array(8).fill(false));

  useEffect(() => {
    if (worker == null) {
      worker = new TamaWorker();
      worker.addEventListener("message", ({ data }) => {
        if (Array.isArray(data)) {
          setScreenMatrix(data);
        } else {
          const { icon, val } = data as { icon: number; val: number };
          setIcons([
            ...icons.slice(0, icon),
            val === 0,
            ...icons.slice(icon + 1),
          ]);
        }
      });

      console.log("Telling worker to start");
      postMessageToWorker("start");
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <IconBar
        icons={[0, 1, 2, 3]}
        status={[0, 1, 2, 3].map((icon) => icons[icon])}
      />
      {screenMatrix && <Screen matrix={screenMatrix} />}
      <IconBar
        icons={[4, 5, 6, 7]}
        status={[4, 5, 6, 7].map((icon) => icons[icon])}
      />
      <div className="flex justify-center gap-10">
        <Button label="A" toucButton={postMessageToWorker} />
        <Button label="B" toucButton={postMessageToWorker} />
        <Button label="C" toucButton={postMessageToWorker} />
      </div>
    </div>
  );
}

export default App;
