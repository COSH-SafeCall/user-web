import "./styles/Icon.css";
import type { IconName } from "../types";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({
  name,
  size = 24,
  className = "",
}: IconProps) {
  return (
    <span
      className={`material-symbols-rounded icon ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}

