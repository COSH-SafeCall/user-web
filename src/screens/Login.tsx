import "./styles/Login.css";
import logo from "../assets/Safecall_logo.png";
import { Canvas } from "../components/Canvas";
import { KakaoLoginButton } from "../components/KakaoLoginButton";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function Login({ go }: { go: Go }) {
  return (
    <Canvas className="login" style={useScale()}>
      <section className="login-brand">
        <img src={logo} alt="SafeCall" className="login-logo" />
        <p>내 손 안의 안심 통화 서비스</p>
        <h1>SafeCall</h1>
      </section>
      <section className="login-actions">
        <KakaoLoginButton onClick={() => go("profile")} />
        <button className="guest-button" onClick={() => go("home")}>
          로그인 없이 빠르게 사용하기
        </button>
      </section>
    </Canvas>
  );
}
