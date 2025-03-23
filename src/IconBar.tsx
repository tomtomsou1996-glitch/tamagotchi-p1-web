import { faDeezer } from "@fortawesome/free-brands-svg-icons";
import {
  faBaseballBatBall,
  faHeadSideCough,
  faLightbulb,
  faMasksTheater,
  faShower,
  faSyringe,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";

interface IconBarProps {
  icons: number[];
  status: boolean[];
}

const ICONS = [
  faUtensils,
  faLightbulb,
  faBaseballBatBall,
  faSyringe,
  faShower,
  faDeezer,
  faHeadSideCough,
  faMasksTheater,
];

export default function IconBar({ icons, status }: IconBarProps) {
  return (
    <div>
      <div className="flex h-[64px] items-center justify-center align-middle">
        {icons.map((icon, index) => {
          const isOn = status[index];
          return (
            <FontAwesomeIcon
              key={`icon-${icon.toString()}`}
              className={clsx(
                `
                  aspect-square w-full grow-1 text-2xl
                  drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
                `,
                {
                  "text-black/90": isOn,
                  "text-white/90": !isOn,
                }
              )}
              icon={ICONS[icon]}
            />
          );
        })}
      </div>
    </div>
  );
}
