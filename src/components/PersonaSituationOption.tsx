import type { IconType } from "react-icons";

type PersonaSituationOptionProps = {
  icon: IconType;
  iconClass: string;
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function PersonaSituationOption({
  icon: SituationIcon,
  iconClass,
  label,
  selected,
  onClick,
}: PersonaSituationOptionProps) {
  return (
    <button
      className={`persona-option ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="persona-visual persona-circle">
        <SituationIcon
          className={`persona-react-icon ${iconClass}`}
          aria-hidden="true"
        />
      </span>
      <b>{label}</b>
    </button>
  );
}
