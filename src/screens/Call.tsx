import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import type { Go, IconName } from "../types";

export function Call({ go }: { go: Go }) {
  const actions: [IconName, string][] = [
    ["sms", "녹음"],
    ["videocam", "영상통화"],
    ["bluetooth", "블루투스"],
    ["speaker", "스피커"],
    ["mic_off", "내 소리 차단"],
    ["dialpad", "키패드"],
  ];

  return (
    <Canvas className="call-gradient call-active">
      <p className="call-time">00:00</p>
      <h1>아빠</h1>
      <p className="call-hint">미리 녹음된 음성을 재생합니다.</p>
      <button className="alt-call">대체통화</button>
      <section className="call-pad">
        {actions.map(([icon, label]) => (
          <button key={label}>
            <Icon name={icon} size={36} />
            <span>{label}</span>
          </button>
        ))}
        <button className="end" onClick={() => go("home")}>
          <Icon name="call_end" size={38} />
        </button>
      </section>
      <p className="call-bottom">
        통화 종료를 제외한 나머지 기능은 실제 제공되는 기능이 아닙니다.
      </p>
    </Canvas>
  );
}
