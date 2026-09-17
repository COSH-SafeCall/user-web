import "./styles/Home.css";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { IconType } from "react-icons";
import {
  MdAddIcCall,
  MdDirectionsCarFilled,
  MdDirectionsRun,
  MdHelp,
  MdOutlineGroups,
  MdRecordVoiceOver,
  MdSms,
  MdSettings,
} from "react-icons/md";
import { Canvas } from "../components/Canvas";
import type {
  CallOptionsView,
  HomeView,
  ScenarioCode,
} from "../api/contracts";
import type { Go } from "../types";

type HomeProps = {
  go: Go;
  onRegularStart: () => void;
  onQuickStart: (scenarioCode: ScenarioCode) => void;
  onEmergencyMessage: () => void;
  homeData: HomeView | null;
  callOptions: CallOptionsView | null;
};

type QuickStartChoice = {
  icon: IconType;
  direction: "up" | "right" | "down" | "left";
  label: string;
  shortLabel: string;
  code: ScenarioCode;
};

type Point = {
  x: number;
  y: number;
};

const LONG_PRESS_MS = 1000;
const MOVE_CANCEL_THRESHOLD = 14;
const CHOICE_ACTIVATION_DISTANCE = 54;
const MAX_DRAG_DISTANCE = 126;

const fallbackQuickStartChoices: QuickStartChoice[] = [
  {
    code: "FOLLOWED",
    icon: MdDirectionsRun,
    direction: "up",
    label: "누군가 따라오는 것 같아요",
    shortLabel: "따라오는 사람",
  },
  {
    code: "UNSAFE_TAXI",
    icon: MdDirectionsCarFilled,
    direction: "right",
    label: "택시 안이 불안해요",
    shortLabel: "택시 안",
  },
  {
    code: "STRANGER_NEARBY",
    icon: MdRecordVoiceOver,
    direction: "down",
    label: "낯선 사람이 근처에 있어요",
    shortLabel: "낯선 사람",
  },
  {
    code: "WALKING_ALONE",
    icon: MdOutlineGroups,
    direction: "left",
    label: "혼자 귀가하기 무서워요",
    shortLabel: "혼자 귀가",
  },
];

function getChoiceIndex(x: number, y: number) {
  if (Math.hypot(x, y) < CHOICE_ACTIVATION_DISTANCE) {
    return null;
  }

  const angle = (Math.atan2(y, x) * 180) / Math.PI;

  if (angle >= -135 && angle < -45) {
    return 0;
  }
  if (angle >= -45 && angle < 45) {
    return 1;
  }
  if (angle >= 45 && angle < 135) {
    return 2;
  }
  return 3;
}

function clampDrag(x: number, y: number): Point {
  const distance = Math.hypot(x, y);

  if (distance <= MAX_DRAG_DISTANCE) {
    return { x, y };
  }

  const ratio = MAX_DRAG_DISTANCE / distance;
  return { x: x * ratio, y: y * ratio };
}

const quickChoiceVisuals = new Map(
  fallbackQuickStartChoices.map((choice) => [choice.code, choice]),
);

export function Home({
  go,
  onRegularStart,
  onQuickStart,
  onEmergencyMessage,
  homeData,
  callOptions,
}: HomeProps) {
  const canShareLocation = homeData?.isLocationPermissionGranted ?? false;
  const quickStartChoices = callOptions
    ? callOptions.scenarios
        .map((scenario) => {
          const visual = quickChoiceVisuals.get(scenario.code);
          return visual
            ? {
                ...visual,
                label: scenario.label,
              }
            : null;
        })
        .filter((choice): choice is QuickStartChoice => choice !== null)
        .sort(
          (a, b) =>
            fallbackQuickStartChoices.findIndex((item) => item.code === a.code) -
            fallbackQuickStartChoices.findIndex((item) => item.code === b.code),
        )
    : fallbackQuickStartChoices;
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [activeChoice, setActiveChoice] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const holdTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const pointerStartRef = useRef<Point>({ x: 0, y: 0 });
  const quickStartOpenRef = useRef(false);
  const activeChoiceRef = useRef<number | null>(null);
  const pointerCancelledRef = useRef(false);

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const setMenuOpen = (open: boolean) => {
    quickStartOpenRef.current = open;
    setQuickStartOpen(open);
  };

  const setChoice = (index: number | null) => {
    activeChoiceRef.current = index;
    setActiveChoice(index);
  };

  const resetQuickStart = () => {
    clearHoldTimer();
    pointerIdRef.current = null;
    pointerCancelledRef.current = false;
    setChoice(null);
    setDragOffset({ x: 0, y: 0 });
    setMenuOpen(false);
  };

  const openQuickStart = () => {
    clearHoldTimer();
    setChoice(null);
    setDragOffset({ x: 0, y: 0 });
    setMenuOpen(true);
  };

  const chooseQuickStart = (index: number) => {
    resetQuickStart();
    onQuickStart(quickStartChoices[index].code);
  };

  useEffect(() => () => clearHoldTimer(), []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    clearHoldTimer();
    pointerIdRef.current = event.pointerId;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerCancelledRef.current = false;
    setChoice(null);
    setDragOffset({ x: 0, y: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);

    holdTimerRef.current = window.setTimeout(
      openQuickStart,
      callOptions?.quickStart.holdMs ?? LONG_PRESS_MS,
    );
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    const x = event.clientX - pointerStartRef.current.x;
    const y = event.clientY - pointerStartRef.current.y;

    if (!quickStartOpenRef.current) {
      if (Math.hypot(x, y) > MOVE_CANCEL_THRESHOLD) {
        pointerCancelledRef.current = true;
        clearHoldTimer();
      }
      return;
    }

    event.preventDefault();
    setDragOffset(clampDrag(x, y));
    setChoice(getChoiceIndex(x, y));
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    clearHoldTimer();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const menuWasOpen = quickStartOpenRef.current;
    const selectedChoice = activeChoiceRef.current;
    const pointerWasCancelled = pointerCancelledRef.current;
    resetQuickStart();

    if (menuWasOpen) {
      if (selectedChoice !== null) {
        onQuickStart(quickStartChoices[selectedChoice].code);
      }
      return;
    }

    if (!pointerWasCancelled) {
      onRegularStart();
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetQuickStart();
  };

  const callButtonStyle = {
    "--quick-drag-x": `${dragOffset.x}px`,
    "--quick-drag-y": `${dragOffset.y}px`,
  } as CSSProperties;

  return (
    <Canvas className={`home ${quickStartOpen ? "quick-start-active" : ""}`}>
      <button className="home-settings" onClick={() => go("setting")}>
        <MdSettings className="home-top-icon settings" aria-hidden="true" />
      </button>
      <button className="home-help" onClick={() => go("help")}>
        <MdHelp className="home-top-icon help" aria-hidden="true" />
      </button>
      <section className="home-copy">
        <h1>눌러서 AI 안심통화를 시작하세요</h1>
        <p>가상 통화는 실제 신고나 구조를 대신하지 않습니다.</p>
      </section>
      <div
        id="quick-start-options"
        className={`quick-start-menu ${quickStartOpen ? "open" : ""}`}
        aria-hidden={!quickStartOpen}
      >
        <p>원하는 상황으로 밀어서 선택하세요</p>
        <div className="quick-start-orbit" />
        {quickStartChoices.map(
          ({ icon: ChoiceIcon, direction, label, shortLabel, code }, index) => (
            <button
              key={code}
              type="button"
              className={`quick-start-choice ${direction} ${
                activeChoice === index ? "selected" : ""
              }`}
              onClick={() => chooseQuickStart(index)}
              tabIndex={quickStartOpen ? 0 : -1}
              aria-label={`${label}, 아빠에게 빠른 통화 시작`}
            >
              <ChoiceIcon aria-hidden="true" />
              <span>{shortLabel}</span>
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className={`call-main ${quickStartOpen ? "marking" : ""}`}
        style={callButtonStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => {
          if (event.detail === 0) {
            if (quickStartOpenRef.current) {
              resetQuickStart();
            } else {
              onRegularStart();
            }
          }
        }}
        aria-label={
          quickStartOpen
            ? "빠른 시작 취소"
            : "AI 안심 통화 시작. 길게 누르면 빠른 시작 메뉴가 열립니다."
        }
        aria-expanded={quickStartOpen}
      >
        <MdAddIcCall className="call-main-icon" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="quick-start-fallback"
        onClick={openQuickStart}
        aria-expanded={quickStartOpen}
        aria-controls="quick-start-options"
      >
        빠른 시작 메뉴
      </button>
      <button
        type="button"
        className="home-emergency-message"
        onClick={onEmergencyMessage}
      >
        <MdSms aria-hidden="true" />
        긴급 메시지 작성
      </button>
      <p className="home-status">
        긴급 메시지는 <b>데모 화면</b>으로 제공됩니다.
        <br />
        위치 공유가{" "}
        {canShareLocation ? (
          <b>사용 가능</b>
        ) : (
          <button
            className="home-status-link unavailable"
            onClick={() => go("permissionSetting")}
            aria-label="위치 권한 설정 화면으로 이동"
          >
            사용 불가능
          </button>
        )}
        합니다.
      </p>
    </Canvas>
  );
}
