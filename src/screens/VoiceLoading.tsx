import { Canvas } from "../components/Canvas";
import type { Go } from "../types";

export function VoiceLoading({ go }: { go: Go }) {
  return (
    <Canvas
      className="voice-loading"
      onClick={() => go("callRinging")}
    >
      <h1>가상 통화를 준비하고 있습니다...</h1>
      <div className="voice-bars">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>
        AI는 실제로 실행되지 않은 112 신고,<br />
        긴급 문자 발송 또는 위치 링크 전송이<br />
        완료되었다고 말하지 않습니다.
        <br />
        <br />
        AI는 사용자를 대신해 위험 여부를<br />
        판단하거나 긴급 문자 발송 또는<br />
        112 신고를 실행하지 않습니다.
        <br />
        <br />
        AI는 사용자에게 위험 인물과 대치,<br />
        추적 또는 촬영을 유도하지 않습니다.
      </p>
    </Canvas>
  );
}
