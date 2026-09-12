type BottomButtonProps = {
  label: string;
  onClick: () => void;
  dark?: boolean;
  light?: boolean;
};

export function BottomButton({
  label,
  onClick,
  dark,
  light,
}: BottomButtonProps) {
  return (
    <button
      className={`bottom-button ${dark ? "dark" : ""} ${light ? "light" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
