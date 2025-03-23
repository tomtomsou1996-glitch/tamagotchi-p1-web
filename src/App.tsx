import "./App.css";

import { useEffect, useState } from "react";

import imgUrl from "./bg.webp";
import Button from "./Button";
import IconBar from "./IconBar";
import Screen from "./Screen";
import TamaWorker from "./worker?worker";
let worker;

export const SCREEN_WIDTH = 32;

// todo
// * audio
// speed control
// tamagochi -> tamagotchi
function postMessageToWorker(data) {
  if (worker != null) {
    //console.log("Posting message to worker: ", data);
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
          if (data.length == 8) {
            setIcons(data.map((icon) => icon === 1));
          } else {
            setScreenMatrix(data);
          }
        }
      });

      console.log("Telling worker to start");
      postMessageToWorker("start");
    }
  }, []);

  return (
    <div className="flex w-[330px] flex-col gap-2">
      <div className="relative flex h-[312px] w-full flex-col bg-no-repeat">
        <IconBar
          icons={[0, 1, 2, 3]}
          status={[0, 1, 2, 3].map((icon) => icons[icon])}
        />
        {screenMatrix && <Screen matrix={screenMatrix} />}
        <IconBar
          icons={[4, 5, 6, 7]}
          status={[4, 5, 6, 7].map((icon) => icons[icon])}
        />
        <div
          className={`
            absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30
          `}
          style={{
            backgroundImage: `url(${imgUrl})`,
          }}
        ></div>
      </div>
      <div className="flex justify-center gap-10">
        <Button label="A" toucButton={postMessageToWorker} />
        <Button label="B" toucButton={postMessageToWorker} />
        <Button label="C" toucButton={postMessageToWorker} />
      </div>
      <button
        type="button"
        className="border-2"
        onClick={() => {
          postMessageToWorker("load");
        }}
      >
        Load
      </button>
      <button
        type="button"
        className="border-2"
        onClick={() => {
          postMessageToWorker("save");
        }}
      >
        Save
      </button>
    </div>
  );
}

export default App;
