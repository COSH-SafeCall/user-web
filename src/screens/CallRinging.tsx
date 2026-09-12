import father from "../assets/figma/raw-image-1.jpeg";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

export function CallRinging({ go }: { go: Go }) {
  return (
    <Canvas className="call-gradient">
      <section className="ring-title">
        <p>수신전화</p>
        <h1>아빠</h1>
        <img src={father} alt="아빠" />
      </section>
      <p className="ring-warning">
        <Icon name="notifications" size={18} />
        안심통화는<br />
        실제 신고나 구조를<br />
        대신하지 않습니다.
      </p>
      <div className="ring-actions">
        <button className="answer" onClick={() => go("call")}>
          <Icon name="phone" size={32} />
        </button>
        <button className="decline" onClick={() => go("home")}>
          <Icon name="call_end" size={32} />
        </button>
      </div>
    </Canvas>
  );
}
