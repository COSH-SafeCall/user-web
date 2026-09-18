import "./styles/Call.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import father from "../assets/figma/raw-image-1.jpeg";
import incomingRingtone from "../assets/audio/zapsplat_multimedia_ringtone_smartphone_mallets_musical_004_107249.mp3";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

export function CallRinging({
  go,
  displayName,
  onAnswer,
  onDecline,
  playRingtone,
}: {
  go: Go;
  displayName: string;
  onAnswer: () => Promise<void>;
  onDecline: () => Promise<void>;
  playRingtone: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const stopRingtone = useCallback(() => {
    const ringtone = ringtoneRef.current;
    if (!ringtone) return;
    ringtone.pause();
    ringtone.currentTime = 0;
    ringtoneRef.current = null;
  }, []);

  useEffect(() => {
    if (!playRingtone) return;

    const ringtone = new Audio(incomingRingtone);
    ringtone.loop = true;
    ringtone.preload = "auto";
    ringtone.volume = 0.7;
    ringtoneRef.current = ringtone;

    void ringtone.play().catch(() => {
      if (ringtoneRef.current === ringtone) {
        ringtoneRef.current = null;
      }
    });

    const stopOnPageExit = () => stopRingtone();
    const stopWhenHidden = () => {
      if (document.visibilityState === "hidden") stopRingtone();
    };

    window.addEventListener("pagehide", stopOnPageExit);
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      window.removeEventListener("pagehide", stopOnPageExit);
      document.removeEventListener("visibilitychange", stopWhenHidden);
      ringtone.pause();
      ringtone.currentTime = 0;
      if (ringtoneRef.current === ringtone) {
        ringtoneRef.current = null;
      }
    };
  }, [playRingtone, stopRingtone]);

  return (
    <Canvas className="call-gradient call-ringing">
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
          disabled={busy}
          onClick={() => {
            stopRingtone();
            setBusy(true);
            void onAnswer()
              .catch(() => undefined)
              .finally(() => setBusy(false));
          }}
        >
          <MdCall className="ring-call-icon" aria-hidden="true" />
        </button>
        <button
          className="decline"
          aria-label="통화 거절"
          disabled={busy}
          onClick={() => {
            stopRingtone();
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
