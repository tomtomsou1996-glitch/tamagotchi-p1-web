import { faDeezer } from "@fortawesome/free-brands-svg-icons";
import { faBaseballBatBall, faFaceGrinTears, faLightbulb, faPoop, faSchool, faSyringe, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";

interface IconBarProps {
  icons: number[],
  status: boolean[],
}

const ICONS = [
  faUtensils,
  faLightbulb,
  faBaseballBatBall,
  faSyringe,
  faPoop,
  faDeezer,
  faSchool,
  faFaceGrinTears
];

export default function IconBar({ icons, status }: IconBarProps) {
  return (
    <div className="flex">{icons.map((icon, index) => {
      const isOn = status[index];
      return (
        <FontAwesomeIcon
          key={`icon-${icon.toString()}`}
          className={clsx("grow-1 text-4xl", {
            "text-black": isOn,
            "text-gray-300": !isOn
          })}
          icon={ICONS[icon]} />
      );
    })}</div>
  );
}