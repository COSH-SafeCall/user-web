import "./styles/KakaoLoginButton.css";

type KakaoLoginButtonProps = {
  onClick: () => void;
};

export function KakaoLoginButton({ onClick }: KakaoLoginButtonProps) {
  return (
    <button className="kakao-login-button" onClick={onClick}>
      <svg
        className="kakao-login-symbol"
        viewBox="0 0 26 24"
        aria-hidden="true"
      >
        <path d="M13 2C6.37 2 1 6.16 1 11.29c0 3.28 2.22 6.16 5.57 7.81l-1.08 3.93c-.1.36.31.65.62.44l4.7-3.12c.71.1 1.44.16 2.19.16 6.63 0 12-4.16 12-9.29S19.63 2 13 2Z" />
      </svg>
      <span>카카오로 로그인하기</span>
    </button>
  );
}
