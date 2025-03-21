import { clsx } from "clsx";

import { SCREEN_WIDTH } from "./App";

interface ScreenProps {
  matrix: number[];
}

export default function Screen({ matrix }: ScreenProps) {
  return (
    <div className="flex flex-col">
      {matrix.map((rowData, rowIndex) => (
        <div
          key={`row-${rowIndex.toString()}`}
          className="flex"
        >
          {Array.from({ length: SCREEN_WIDTH }, (_, colIndex) => {
            const bitPosition = SCREEN_WIDTH - 1 - colIndex;
            const isOn = (rowData & (1 << bitPosition)) !== 0;

            return (
              <div
                key={`pixel-${rowIndex.toString()}-${colIndex.toString()}`}
                className={clsx(`
                  aspect-square w-[20px] shrink-0 border-1 border-solid
                  border-gray-50
                `,
                  {

                    'bg-black': isOn,
                    'bg-gray-100': !isOn
                  })}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};