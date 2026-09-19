import "./styles/SoundSetting.css";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import brightSignalRingtone from "../assets/audio/ringtone-bright-signal.wav";
import gentleBellRingtone from "../assets/audio/ringtone-gentle-bell.wav";
import softPulseRingtone from "../assets/audio/ringtone-soft-pulse.wav";
import soundModeFeedbackAudio from "../assets/audio/sound-mode-feedback.wav";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import { RequirementErrorMessage } from "../components/RequirementErrorMessage";
import type { IncomingAlertMode, SettingView } from "../api/contracts";
import type { Go, IconName } from "../types";

type TouchFeedback = {
  id: number;
  target: string;
  x: number;
  y: number;
  size: number;
};

type RingtoneOption = {
  name: string;
  description: string;
  src: string;
};

const ringtoneOptions: RingtoneOption[] = [
  {
    name: "잔잔한 벨소리",
    description: "부드럽게 울리는 기본 알림음",
    src: gentleBellRingtone,
  },
  {
    name: "부드러운 펄스",
    description: "낮고 안정적인 반복 신호음",
    src: softPulseRingtone,
  },
  {
    name: "맑은 신호음",
    description: "밝고 선명한 짧은 벨소리",
    src: brightSignalRingtone,
  },
];

const RINGTONE_SELECTION_SCREEN_ENABLED = false;

export function SoundSetting({
  go,
  mode,
  setMode,
  ringtone,
  setRingtone,
  setting,
  onChangeMode,
}: {
  go: Go;
  mode: string;
  setMode: (value: string) => void;
  ringtone: string;
  setRingtone: (value: string) => void;
  setting: SettingView | null;
  onChangeMode: (mode: IncomingAlertMode) => Promise<void>;
}) {
  const modes: [string, IconName][] = [
    ["소리", "volume_up"],
    ["진동", "vibration"],
    ["무음", "volume_off"],
  ];
  const [touchFeedback, setTouchFeedback] = useState<TouchFeedback | null>(
    null,
  );
  const [isRingtoneDialogOpen, setIsRingtoneDialogOpen] = useState(false);
  const [showVibrationError, setShowVibrationError] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundFeedbackAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }

      previewAudioRef.current?.pause();
      soundFeedbackAudioRef.current?.pause();
    };
  }, []);

  const showTouchFeedback = (
    event: PointerEvent<HTMLButtonElement>,
    target: string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const id = Date.now();

    setTouchFeedback({
      id,
      target,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      size,
    });

    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setTouchFeedback((current) => (current?.id === id ? null : current));
    }, 580);
  };

  const renderTouchFeedback = (target: string) => {
    if (touchFeedback?.target !== target) {
      return null;
    }

    return (
      <span
        aria-hidden="true"
        className="sound-touch-feedback"
        style={
          {
            "--feedback-x": `${touchFeedback.x}px`,
            "--feedback-y": `${touchFeedback.y}px`,
            "--feedback-size": `${touchFeedback.size}px`,
          } as CSSProperties
        }
      />
    );
  };

  const playRingtonePreview = (src: string) => {
    previewAudioRef.current?.pause();

    const previewAudio = new Audio(src);
    previewAudioRef.current = previewAudio;
    previewAudio.volume = 0.55;
    previewAudio.play().catch(() => {
      previewAudioRef.current = null;
    });
  };

  const playSoundModeFeedback = () => {
    soundFeedbackAudioRef.current?.pause();

    const feedbackAudio = new Audio(soundModeFeedbackAudio);
    soundFeedbackAudioRef.current = feedbackAudio;
    feedbackAudio.volume = 0.5;
    feedbackAudio.play().catch(() => {
      soundFeedbackAudioRef.current = null;
    });
  };

  const selectSoundMode = async (title: string) => {
    if (title === "진동") {
      setShowVibrationError(true);
      return;
    }

    if (savingMode) return;
    setSavingMode(true);

    try {
      await onChangeMode(title === "소리" ? "RINGTONE" : "SILENT");
      setMode(title);

      if (title === "소리") {
        playSoundModeFeedback();
      }
    } catch {
      // 상위 공통 오류 모달을 표시하고 기존 모드를 유지합니다.
    } finally {
      setSavingMode(false);
    }
  };

  useEffect(() => {
    if (setting) {
      setMode(setting.incomingAlertMode === "RINGTONE" ? "소리" : "무음");
    }
  }, [setMode, setting]);

  const selectRingtone = (option: RingtoneOption) => {
    setRingtone(option.name);
    playRingtonePreview(option.src);
  };

  const closeRingtoneDialog = () => {
    previewAudioRef.current?.pause();
    setIsRingtoneDialogOpen(false);
  };

  const handleRingtoneEntryClick = () => {
    if (RINGTONE_SELECTION_SCREEN_ENABLED) {
      setIsRingtoneDialogOpen(true);
    }
  };

  return (
    <Canvas className="sound-setting" layout="scroll">
      <Header title="가상 통화 수신 벨소리 설정" back={() => go("setting")} />
      <section className="sound-card">
        <p>수신 방식</p>
        <div>
          {modes.map(([title, icon]) => (
            <button
              key={title}
              disabled={savingMode}
              onClick={() => void selectSoundMode(title)}
              onPointerDown={(event) => showTouchFeedback(event, title)}
            >
              {renderTouchFeedback(title)}
              <Icon name={icon} />
              <span>{title}</span>
              <i className={mode === title ? "on" : ""} />
            </button>
          ))}
        </div>
      </section>
      <button
        className="ringtone"
        onClick={handleRingtoneEntryClick}
        onPointerDown={(event) => showTouchFeedback(event, "ringtone")}
      >
        {renderTouchFeedback("ringtone")}
        <span>
          <b>벨소리</b>
          <small>{ringtone}</small>
        </span>
        <Icon name="chevron_right" />
      </button>

      {RINGTONE_SELECTION_SCREEN_ENABLED && isRingtoneDialogOpen && (
        <div className="ringtone-dialog-layer" role="presentation">
          <button
            className="ringtone-dialog-backdrop"
            aria-label="벨소리 선택 창 닫기"
            onClick={closeRingtoneDialog}
          />
          <section
            className="ringtone-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ringtone-dialog-title"
          >
            <div className="ringtone-dialog-header">
              <div>
                <h2 id="ringtone-dialog-title">벨소리 선택</h2>
                <p>앱 내부에 저장된 저작권 무료 벨소리입니다.</p>
              </div>
              <button onClick={closeRingtoneDialog}>닫기</button>
            </div>
            <div className="ringtone-options">
              {ringtoneOptions.map((option) => {
                const selected = ringtone === option.name;

                return (
                  <button
                    key={option.name}
                    className={selected ? "selected" : ""}
                    aria-pressed={selected}
                    onClick={() => selectRingtone(option)}
                  >
                    <span>
                      <b>{option.name}</b>
                      <small>{option.description}</small>
                    </span>
                    <i aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
      {showVibrationError && (
        <div className="modal-layer">
          <RequirementErrorMessage
            type="mobileOnlyVibration"
            onConfirm={() => setShowVibrationError(false)}
          />
        </div>
      )}
    </Canvas>
  );
}
