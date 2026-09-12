import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

const helpRows = [
  "SOS 기능을 다시 켜고 싶어요.",
  "긴급 연락처를 수정하고 싶어요.",
  "긴급 연락처를 입력하지 않아도 괜찮은가요?",
  "가상 전화를 소리 말고 진동이나 무음으로 받고 싶어요.",
  "음량 조절이 필수적인가요?",
];

export function HelpScreen({ go, open }: { go: Go; open?: boolean }) {
  return (
    <Canvas className="help-screen">
      <Header title="도움말" back={() => go("setting")} />
      <section className="help-list">
        {helpRows.map((row, index) => (
          <button
            key={row}
            onClick={() => index === 0 && go("helpOpen")}
          >
            <span>
              <b>Q.</b> {row}
            </span>
            <Icon name="chevron_right" />
            {open && index === 0 && (
              <p>SOS 기능은 기기 설정에서 다시 활성화할 수 있습니다.</p>
            )}
          </button>
        ))}
      </section>
    </Canvas>
  );
}
