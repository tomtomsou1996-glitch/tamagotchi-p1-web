import "./App.css";

import { useEffect, useRef, useState } from "react";

import imgUrl from "./bg.webp";
import Button from "./Button";
import IconBar from "./IconBar";
import Screen from "./Screen";
import { useBeep } from "./useBeep";
import TamaWorker from "./worker?worker";
let worker: Worker | undefined;

export const SCREEN_WIDTH = 32;

function postMessageToWorker(data) {
  if (worker != null) {
    worker.postMessage(data);
  }
}

function App() {
  const [screenMatrix, setScreenMatrix] = useState<number[] | undefined>();
  const [icons, setIcons] = useState<boolean[]>(new Array(8).fill(false));
  const [startBeep, stopBeep] = useBeep();

  const isMuted = useRef<boolean>(true);

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
        } else if (Number.isFinite(data)) {
          if (data === -1) {
            stopBeep();
          } else if (!isMuted.current) {
            startBeep(data as number);
          }
        }
      });

      console.log("Telling worker to start");
      postMessageToWorker("start");
    }
  }, []);

  return (
    <div className="flex w-[330px] flex-col items-center gap-2 select-none">
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

      <div className="flex w-full">
        <button
          type="button"
          className="flex-grow border-1"
          onClick={() => {
            isMuted.current = !isMuted.current;
          }}
        >
          {isMuted.current ? "Unmute" : "Mute"}
        </button>
        <a
          href="https://tamaplanet.com/images/docs/Tama_Manuals/p1.pdf"
          target="_blank"
          rel="noreferrer noopener"
          className={"flex-grow border-1 text-center"}
        >
          Manual
        </a>
      </div>
    </div>
  );
}

export default App;
