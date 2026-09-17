import "./styles/Call.css";
import { useEffect, useRef, useState } from "react";
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
import alternativeCallAudio from "../assets/audio/alternative-call.wav";
import { Canvas } from "../components/Canvas";
import { RequirementErrorMessage } from "../components/RequirementErrorMessage";
import type { CallEndReason } from "../api/contracts";
import type { Go } from "../types";

type CallAction = {
  icon: IconType;
  iconClass: string;
  label: string;
};

function formatCallTime(elapsedSeconds: number) {
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function Call({
  go,
  displayName,
  onEnd,
}: {
  go: Go;
  displayName: string;
  onEnd: (reason: CallEndReason) => Promise<void>;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAlternativeCallActive, setIsAlternativeCallActive] = useState(false);
  const [isCallEnding, setIsCallEnding] = useState(false);
  const [showUnavailableError, setShowUnavailableError] = useState(false);
  const alternativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const endCallTimeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const alternativeAudio = alternativeAudioRef.current;

    return () => {
      if (endCallTimeoutRef.current) {
        window.clearTimeout(endCallTimeoutRef.current);
      }

      alternativeAudio?.pause();
    };
  }, []);

  const handleAlternativeCallClick = async () => {
    if (isCallEnding) {
      return;
    }

    await onEnd("SWITCH_TO_FALLBACK");
    const alternativeAudio = alternativeAudioRef.current;

    setIsAlternativeCallActive(true);

    if (!alternativeAudio) {
      return;
    }

    alternativeAudio.currentTime = 0;
    alternativeAudio.play().catch(() => {
      setIsAlternativeCallActive(false);
    });
  };

  const handleEndCallClick = async () => {
    if (isCallEnding) {
      return;
    }

    alternativeAudioRef.current?.pause();
    setShowUnavailableError(false);
    setIsCallEnding(true);

    await onEnd("USER_ENDED");

    endCallTimeoutRef.current = window.setTimeout(() => {
      go("home");
    }, 420);
  };

  return (
    <Canvas
      className={`call-gradient call-active call-connected${
        isCallEnding ? " call-ending" : ""
      }`}
    >
      <p className="call-time">{formatCallTime(elapsedSeconds)}</p>
      <h1>{displayName}</h1>
      <p className="call-hint">미리 녹음된 음성을 재생합니다.</p>
      {isAlternativeCallActive ? (
        <p className="alt-call-status" aria-live="polite">
          대체 통화 중입니다
        </p>
      ) : (
        <button
          className="alt-call"
          disabled={isCallEnding}
          onClick={() => void handleAlternativeCallClick()}
        >
          대체통화
        </button>
      )}
      <audio
        ref={alternativeAudioRef}
        src={alternativeCallAudio}
        loop
        preload="auto"
      />
      <section className="call-pad">
        {actions.map(({ icon: ActionIcon, iconClass, label }) => (
          <button
            key={label}
            disabled={isCallEnding}
            onClick={() => setShowUnavailableError(true)}
          >
            <ActionIcon
              className={`call-control-icon ${iconClass}`}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        ))}
        <button
          className="end"
          disabled={isCallEnding}
          onClick={() => void handleEndCallClick()}
        >
          <MdCallEnd className="call-end-icon" aria-hidden="true" />
        </button>
      </section>
      <p className="call-bottom">
        통화 종료를 제외한 나머지 기능은 실제 제공되는 기능이 아닙니다.
      </p>
      {showUnavailableError && (
        <div className="modal-layer">
          <RequirementErrorMessage
            type="unavailableCallControl"
            onConfirm={() => setShowUnavailableError(false)}
          />
        </div>
      )}
    </Canvas>
  );
}
