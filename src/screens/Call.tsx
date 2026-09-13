import "./styles/Call.css";
import type { IconType } from "react-icons";
import {
  MdBluetooth,
  MdCallEnd,
  MdDialpad,
  MdMicOff,
  MdOutlineVideocam,
  MdVolumeUp,
} from "react-icons/md";
import { PiCassetteTapeFill } from "react-icons/pi";
import { Canvas } from "../components/Canvas";
import type { Go } from "../types";

type CallAction = {
  icon: IconType;
  iconClass: string;
  label: string;
};

export function Call({ go }: { go: Go }) {
  const actions: CallAction[] = [
    {
      icon: PiCassetteTapeFill,
      iconClass: "cassette",
      label: "녹음",
    },
    {
      icon: MdOutlineVideocam,
      iconClass: "video",
      label: "영상통화",
    },
    {
      icon: MdBluetooth,
      iconClass: "bluetooth",
      label: "블루투스",
    },
    {
      icon: MdVolumeUp,
      iconClass: "volume",
      label: "스피커",
    },
    {
      icon: MdMicOff,
      iconClass: "mic-off",
      label: "내 소리 차단",
    },
    {
      icon: MdDialpad,
      iconClass: "dialpad",
      label: "키패드",
    },
  ];

  return (
    <Canvas className="call-gradient call-active">
      <p className="call-time">00:00</p>
      <h1>아빠</h1>
      <p className="call-hint">미리 녹음된 음성을 재생합니다.</p>
      <button className="alt-call">대체통화</button>
      <section className="call-pad">
        {actions.map(({ icon: ActionIcon, iconClass, label }) => (
          <button key={label}>
            <ActionIcon
              className={`call-control-icon ${iconClass}`}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        ))}
        <button className="end" onClick={() => go("home")}>
          <MdCallEnd className="call-end-icon" aria-hidden="true" />
        </button>
      </section>
      <p className="call-bottom">
        통화 종료를 제외한 나머지 기능은 실제 제공되는 기능이 아닙니다.
      </p>
    </Canvas>
  );
}

