type PersonaPersonOptionProps = {
  image: string;
  imageClass: string;
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function PersonaPersonOption({
  image,
  imageClass,
  label,
  selected,
  onClick,
}: PersonaPersonOptionProps) {
  return (
    <button
      className={`persona-option ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="persona-visual persona-photo-frame">
        <img className={`persona-photo ${imageClass}`} src={image} alt={label} />
      </span>
      <b>{label}</b>
    </button>
  );
}
