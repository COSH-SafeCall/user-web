import "./styles/CallSetupCheck.css";
import { MdOutlineWifiOff, MdVolumeUp } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";

export function CallSetupCheck({
  go,
  onStart,
  busy,
}: {
  go: Go;
  onStart: () => Promise<void>;
  busy?: boolean;
}) {
  return (
    <Canvas className="call-check">
      <Header title="모두 확인하셨나요?" back={() => go("personaPeople")} />
      <div className="check-icons">
        <div>
          <MdOutlineWifiOff
            className="check-react-icon wifi"
            aria-hidden="true"
          />
          <p>
            와이파이를 끄고 모바일<br />
            데이터를 사용해주세요
          </p>
        </div>
        <div>
          <MdVolumeUp
            className="check-react-icon volume"
            aria-hidden="true"
          />
          <p>볼륨 4-5로 설정해주세요</p>
        </div>
      </div>
      <p className="check-note">
        화면을 나가거나 긴급 SOS 통화를 사용할 경우 AI 통화는 자동으로
        종료됩니다.
      </p>
      <BottomButton
        label={busy ? "통화 생성 중..." : "다음"}
        onClick={() => void onStart()}
        disabled={busy}
        immediate
      />
    </Canvas>
  );
}

