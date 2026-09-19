import "./styles/Call.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import incomingRingtone from "../assets/audio/zapsplat_multimedia_ringtone_smartphone_mallets_musical_004_107249.mp3";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import { counterpartProfiles } from "../counterpartProfiles";
import type { CounterpartCode } from "../api/contracts";
import type { Go } from "../types";

type RingAction = "answer" | "decline";

const MAX_DRAG_DISTANCE = 180;

export function CallRinging({
  go,
  displayName,
  counterpartCode,
  onAnswer,
  onDecline,
  playRingtone,
}: {
  go: Go;
  displayName: string;
  counterpartCode: CounterpartCode;
  onAnswer: () => Promise<void>;
  onDecline: () => Promise<void>;
  playRingtone: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [dragOffset, setDragOffset] = useState<{
    action: RingAction;
    x: number;
  } | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const draggingRef = useRef<{
    action: RingAction;
    pointerId: number;
    startX: number;
    startY: number;
    threshold: number;
  } | null>(null);
  const actionStartedRef = useRef(false);
  const counterpartProfile = counterpartProfiles[counterpartCode];

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

  const runAction = (action: RingAction) => {
    if (busy || actionStartedRef.current) return;
    actionStartedRef.current = true;
    stopRingtone();
    setBusy(true);

    if (action === "answer") {
      void onAnswer()
        .catch(() => undefined)
        .finally(() => {
          actionStartedRef.current = false;
          setBusy(false);
          setDragOffset(null);
        });
      return;
    }

    void onDecline()
      .catch(() => undefined)
      .finally(() => {
        actionStartedRef.current = false;
        setBusy(false);
        setDragOffset(null);
        go("home");
      });
  };

  const handlePointerDown = (
    action: RingAction,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (busy || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const availableDistance =
      (event.currentTarget.parentElement?.clientWidth ?? 0) -
      event.currentTarget.clientWidth;
    draggingRef.current = {
      action,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      threshold: Math.max(96, Math.min(160, availableDistance * 0.65)),
    };
    setDragOffset({ action, x: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragging = draggingRef.current;
    if (!dragging || dragging.pointerId !== event.pointerId) return;

    const distance = event.clientX - dragging.startX;
    const directedDistance = dragging.action === "answer" ? distance : -distance;
    const x = Math.min(Math.max(directedDistance, 0), MAX_DRAG_DISTANCE);
    setDragOffset({ action: dragging.action, x: dragging.action === "answer" ? x : -x });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragging = draggingRef.current;
    if (!dragging || dragging.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - dragging.startX;
    const distanceY = event.clientY - dragging.startY;
    const directedDistance = dragging.action === "answer" ? distanceX : -distanceX;
    draggingRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (
      directedDistance >= dragging.threshold &&
      Math.abs(distanceY) < dragging.threshold * 0.7
    ) {
      const x = Math.min(directedDistance, MAX_DRAG_DISTANCE);
      setDragOffset({ action: dragging.action, x: dragging.action === "answer" ? x : -x });
      runAction(dragging.action);
      return;
    }

    setDragOffset(null);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (draggingRef.current?.pointerId !== event.pointerId) return;
    draggingRef.current = null;
    setDragOffset(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (
    action: RingAction,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      (action === "answer" && event.key === "ArrowRight") ||
      (action === "decline" && event.key === "ArrowLeft")
    ) {
      event.preventDefault();
      setDragOffset({ action, x: 0 });
      runAction(action);
    }
  };

  const dragStyle = (action: RingAction) => {
    if (dragOffset?.action !== action) return undefined;
    return {
      transform: `translateX(${dragOffset.x}px) scale(1.12)`,
      opacity: 1 - (Math.abs(dragOffset.x) / MAX_DRAG_DISTANCE) * 0.75,
    };
  };

  return (
    <Canvas className="call-gradient call-ringing">
      <section className="ring-title">
        <p>수신전화</p>
        <h1>{displayName}</h1>
        <img
          className={`call-profile-image ${counterpartProfile.imageClass}`}
          src={counterpartProfile.image}
          alt={`${displayName} 프로필`}
        />
      </section>
      <p className="ring-warning">
        <Icon name="notifications" size={18} />
        안심통화는<br />
        실제 신고나 구조를<br />
        대신하지 않습니다.
      </p>
      <div className={`ring-actions${dragOffset ? ` ${dragOffset.action}-active` : ""}`}>
        <button
          className={`answer${dragOffset?.action === "answer" && dragOffset.x !== 0 ? " dragging" : ""}`}
          aria-label="통화 받기. 오른쪽으로 드래그하거나 키보드 오른쪽 화살표로 받기"
          aria-hidden={dragOffset?.action === "decline"}
          tabIndex={dragOffset?.action === "decline" ? -1 : 0}
          disabled={busy || dragOffset?.action === "decline"}
          style={dragStyle("answer")}
          onPointerDown={(event) => handlePointerDown("answer", event)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onKeyDown={(event) => handleKeyDown("answer", event)}
        >
          <MdCall className="ring-call-icon" aria-hidden="true" />
        </button>
        <button
          className={`decline${dragOffset?.action === "decline" && dragOffset.x !== 0 ? " dragging" : ""}`}
          aria-label="통화 거절. 왼쪽으로 드래그하거나 키보드 왼쪽 화살표로 거절"
          aria-hidden={dragOffset?.action === "answer"}
          tabIndex={dragOffset?.action === "answer" ? -1 : 0}
          disabled={busy || dragOffset?.action === "answer"}
          style={dragStyle("decline")}
          onPointerDown={(event) => handlePointerDown("decline", event)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onKeyDown={(event) => handleKeyDown("decline", event)}
        >
          <MdCallEnd className="ring-call-icon" aria-hidden="true" />
        </button>
      </div>
    </Canvas>
  );
}
