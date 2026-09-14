import "./styles/VoiceLoading.css";
import { useEffect, useState } from "react";
import { Canvas } from "../components/Canvas";
import type { Go } from "../types";

const VOICE_LOADING_AUTO_ADVANCE_MS = 3000;
const CALL_SCREEN_TRANSITION_MS = 260;

export function VoiceLoading({ go }: { go: Go }) {
  const [ringingSoon, setRingingSoon] = useState(false);

  useEffect(() => {
    const transitionTimerId = window.setTimeout(() => {
      setRingingSoon(true);
    }, VOICE_LOADING_AUTO_ADVANCE_MS);

    const advanceTimerId = window.setTimeout(() => {
      go("callRinging");
    }, VOICE_LOADING_AUTO_ADVANCE_MS + CALL_SCREEN_TRANSITION_MS);

    return () => {
      window.clearTimeout(transitionTimerId);
      window.clearTimeout(advanceTimerId);
    };
  }, [go]);

  return (
    <Canvas className={`voice-loading ${ringingSoon ? "ringing-soon" : ""}`}>
      <div className="voice-loading-content">
        <h1>가상 통화를 준비하고 있습니다...</h1>
        <div className="voice-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="voice-loading-policy">
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
      </div>
    </Canvas>
  );
}
