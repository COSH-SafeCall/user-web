import "./styles/VirtualSignupButton.css";

type VirtualSignupButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function VirtualSignupButton({
  onClick,
  disabled,
}: VirtualSignupButtonProps) {
  return (
    <button
      className="virtual-signup-button"
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        className="virtual-signup-symbol"
        viewBox="0 0 26 24"
        aria-hidden="true"
      >
        <path d="M13 2C6.37 2 1 6.16 1 11.29c0 3.28 2.22 6.16 5.57 7.81l-1.08 3.93c-.1.36.31.65.62.44l4.7-3.12c.71.1 1.44.16 2.19.16 6.63 0 12-4.16 12-9.29S19.63 2 13 2Z" />
      </svg>
      <span>{disabled ? "연결 중..." : "카카오 로그인(가상 로그인)"}</span>
    </button>
  );
}
