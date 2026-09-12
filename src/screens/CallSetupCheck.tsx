import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

export function CallSetupCheck({ go }: { go: Go }) {
  return (
    <Canvas className="call-check">
      <Header title="모두 확인하셨나요?" back={() => go("personaPeople")} />
      <div className="check-icons">
        <div>
          <Icon name="wifi_off" size={72} />
          <p>
            와이파이를 끄고 모바일<br />
            데이터를 사용해주세요
          </p>
        </div>
        <div>
          <Icon name="volume_up" size={78} />
          <p>볼륨 4-5로 설정해주세요</p>
        </div>
      </div>
      <p className="check-note">
        화면을 나가거나 긴급 SOS 통화를 사용할 경우 AI 통화는 자동으로 종료됩니다.
      </p>
      <BottomButton label="다음" onClick={() => go("voiceLoading")} />
    </Canvas>
  );
}
