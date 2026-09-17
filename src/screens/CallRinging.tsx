import "./styles/Call.css";
import { useEffect, useState } from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import father from "../assets/figma/raw-image-1.jpeg";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

const CALL_ANSWER_TRANSITION_MS = 480;

export function CallRinging({
  go,
  displayName,
  onShown,
  onAnswer,
  onDecline,
}: {
  go: Go;
  displayName: string;
  onShown: () => Promise<void>;
  onAnswer: () => Promise<void>;
  onDecline: () => Promise<void>;
}) {
  const [answering, setAnswering] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void onShown();
  }, [onShown]);

  useEffect(() => {
    if (!answering) {
      return;
    }

    const timerId = window.setTimeout(() => {
      go("call");
    }, CALL_ANSWER_TRANSITION_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [answering, go]);

  return (
    <Canvas
      className={`call-gradient call-ringing ${answering ? "answering" : ""}`}
    >
      <section className="ring-title">
        <p>수신전화</p>
        <h1>{displayName}</h1>
        <img src={father} alt={displayName} />
      </section>
      <p className="ring-warning">
        <Icon name="notifications" size={18} />
        안심통화는<br />
        실제 신고나 구조를<br />
        대신하지 않습니다.
      </p>
      <div className="ring-actions">
        <button
          className="answer"
          aria-label="통화 받기"
          disabled={answering || busy}
          onClick={() => {
            setBusy(true);
            void onAnswer()
              .then(() => setAnswering(true))
              .catch(() => undefined)
              .finally(() => setBusy(false));
          }}
        >
          <MdCall className="ring-call-icon" aria-hidden="true" />
        </button>
        <button
          className="decline"
          aria-label="통화 거절"
          disabled={answering || busy}
          onClick={() => {
            setBusy(true);
            void onDecline().finally(() => {
              setBusy(false);
              go("home");
            });
          }}
        >
          <MdCallEnd className="ring-call-icon" aria-hidden="true" />
        </button>
      </div>
    </Canvas>
  );
}
