import "./styles/Complete.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import type { Go } from "../types";

export function Complete({ go }: { go: Go }) {
  return (
    <Canvas className="complete">
      <section>
        <h1>설정이 모두 완료되었습니다.</h1>
      </section>
      <div className="two-buttons">
        <BottomButton dark label="건너뛰기" onClick={() => go("home")} />
        <BottomButton light label="확인" onClick={() => go("home")} />
      </div>
    </Canvas>
  );
}

