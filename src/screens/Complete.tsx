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
      <BottomButton label="다음" onClick={() => go("home")} />
    </Canvas>
  );
}
