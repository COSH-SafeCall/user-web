import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import type { Go, IconName } from "../types";

export function SoundSetting({
  go,
  mode,
  setMode,
}: {
  go: Go;
  mode: string;
  setMode: (value: string) => void;
}) {
  const modes: [string, IconName][] = [
    ["소리", "volume_up"],
    ["진동", "vibration"],
    ["무음", "volume_off"],
  ];

  return (
    <Canvas className="sound-setting">
      <Header title="가상 통화 수신 벨소리 설정" back={() => go("setting")} />
      <section className="sound-card">
        <p>수신 방식</p>
        <div>
          {modes.map(([title, icon]) => (
            <button key={title} onClick={() => setMode(title)}>
              <Icon name={icon} />
              <span>{title}</span>
              <i className={mode === title ? "on" : ""} />
            </button>
          ))}
        </div>
      </section>
      <button className="ringtone">
        <span>
          <b>벨소리</b>
          <small>Over the Horizon</small>
        </span>
        <Icon name="chevron_right" />
      </button>
    </Canvas>
  );
}
