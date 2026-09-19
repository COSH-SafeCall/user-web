import "./styles/Login.css";
import logo from "../assets/Safecall_logo.png";
import { Canvas } from "../components/Canvas";
import { VirtualSignupButton } from "../components/VirtualSignupButton";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function Login({
  onVirtualLogin,
  onGuestLogin,
  busy,
}: {
  onVirtualLogin: () => Promise<void>;
  onGuestLogin: () => Promise<void>;
  busy?: boolean;
}) {
  return (
    <Canvas className="login" style={useScale()}>
      <section className="login-brand">
        <img src={logo} alt="SafeCall" className="login-logo" />
        <p>내 손 안의 안심 통화 서비스</p>
        <h1>SafeCall</h1>
      </section>
      <section className="login-actions">
        <div className="virtual-signup-group">
          <p className="virtual-signup-notice">실제 회원가입이 아닙니다.</p>
          <VirtualSignupButton
            disabled={busy}
            onClick={() => void onVirtualLogin()}
          />
        </div>
        <button
          className="guest-button"
          disabled={busy}
          onClick={() => void onGuestLogin()}
        >
          {busy ? "연결 중..." : "로그인 없이 빠르게 사용하기"}
        </button>
      </section>
    </Canvas>
  );
}
