import "./styles/SettingBlock.css";
import { Icon } from "./Icon";

type SettingBlockProps = {
  names: string[];
  onSelect: (name: string) => void;
};

export function SettingBlock({ names, onSelect }: SettingBlockProps) {
  const className = ["setting-block", names.length === 1 ? "single" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {names.map((name) => (
        <button key={name} onClick={() => onSelect(name)}>
          <span>{name}</span>
          <Icon name="chevron_right" />
        </button>
      ))}
    </div>
  );
}
