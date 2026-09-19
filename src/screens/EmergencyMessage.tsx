import "./styles/EmergencyMessage.css";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdArrowBack,
  MdMoreVert,
  MdSend,
  MdSms,
} from "react-icons/md";
import {
  getSafetyMessageComposer,
  MessageComposerError,
  type MessageComposerView,
} from "../api/messageApi";
import { Canvas } from "../components/Canvas";
import type { Go, Screen } from "../types";
import { requestLocationPermission } from "../utils/browserPermissions";

type MessageLoadState = "loading" | "success" | "error";
type LocationCompositionStatus =
  | "included"
  | "permission-denied"
  | "template-unavailable"
  | "unsupported-coordinate-system"
  | "unavailable";

type MessageErrorView = {
  title: string;
  description: string;
  actionLabel: string;
  target?: Screen;
};

function getMessageErrorView(error: unknown): MessageErrorView {
  if (!(error instanceof MessageComposerError)) {
    return {
      title: "메시지 자료를 불러오지 못했습니다.",
      description: "네트워크 연결을 확인한 뒤 다시 시도해주세요.",
      actionLabel: "다시 시도",
    };
  }

  const views: Record<string, MessageErrorView> = {
    SESSION_EXPIRED: {
      title: "로그인이 만료되었습니다.",
      description: "다시 로그인한 뒤 긴급 메시지를 작성해주세요.",
      actionLabel: "로그인으로 이동",
      target: "login",
    },
    LOGIN_REQUIRED: {
      title: "로그인이 필요합니다.",
      description: "가상 로그인 후 긴급 메시지를 작성할 수 있습니다.",
      actionLabel: "로그인으로 이동",
      target: "login",
    },
    PROFILE_REQUIRED: {
      title: "사용자 정보가 필요합니다.",
      description: "고정 사용자 정보를 먼저 등록해주세요.",
      actionLabel: "사용자 정보로 이동",
      target: "profile",
    },
    CONTACT_REQUIRED: {
      title: "긴급 연락처가 필요합니다.",
      description: "보호자 연락처를 등록한 뒤 다시 시도해주세요.",
      actionLabel: "연락처로 이동",
      target: "contacts",
    },
    CALL_ALREADY_OPEN: {
      title: "진행 중인 통화가 있습니다.",
      description: "통화를 종료한 뒤 긴급 메시지를 다시 작성해주세요.",
      actionLabel: "홈으로 이동",
      target: "home",
    },
    DATA_CLEANUP_PENDING: {
      title: "데이터 삭제 처리 중입니다.",
      description: "삭제 처리가 끝난 뒤 다시 이용할 수 있습니다.",
      actionLabel: "삭제 상태 확인",
      target: "deletionStatus",
    },
  };

  return (
    views[error.code] ?? {
      title: "메시지 자료를 불러오지 못했습니다.",
      description: error.message,
      actionLabel: "다시 시도",
    }
  );
}

function findCoordinateUrlTemplate(value: string) {
  const rawTemplate = value.trim();
  const markdownLabel = /^\[([^\]]+)\]/.exec(rawTemplate)?.[1];
  const markdownDestination = /\]\(([^)]+)\)$/.exec(rawTemplate)?.[1];
  const candidates = [markdownDestination, markdownLabel, rawTemplate];

  return candidates.find(
    (candidate) =>
      candidate?.includes("{latitude}") &&
      candidate.includes("{longitude}"),
  );
}

function completeMapUrl(
  urlTemplate: string,
  latitude: number,
  longitude: number,
) {
  const coordinateTemplate = findCoordinateUrlTemplate(urlTemplate);
  if (!coordinateTemplate) return null;

  const completed = coordinateTemplate
    .replaceAll("{latitude}", String(latitude))
    .replaceAll("{longitude}", String(longitude));

  try {
    const url = new URL(completed);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function composeEmergencyMessage(composer: MessageComposerView) {
  const baseBody = composer.baseBody ?? "";
  const mapTemplate = composer.mapTemplate;

  if (!composer.isLocationPermissionGranted) {
    return {
      message: baseBody,
      locationStatus: "permission-denied" as const,
    };
  }

  if (!mapTemplate?.urlTemplate) {
    return {
      message: baseBody,
      locationStatus: "template-unavailable" as const,
    };
  }

  if (mapTemplate.coordinateSystem?.toUpperCase() !== "WGS84") {
    return {
      message: baseBody,
      locationStatus: "unsupported-coordinate-system" as const,
    };
  }

  const maxAgeMs =
    typeof mapTemplate.maxAgeSeconds === "number"
      ? Math.max(0, mapTemplate.maxAgeSeconds * 1000)
      : null;
  const location = await requestLocationPermission({
    enableHighAccuracy: true,
    maximumAge: maxAgeMs ?? 60000,
    timeout: 30000,
  });

  if (!location.granted || !location.coords) {
    return {
      message: baseBody,
      locationStatus:
        location.reason === "denied"
          ? ("permission-denied" as const)
          : ("unavailable" as const),
    };
  }

  const mapUrl = completeMapUrl(
    mapTemplate.urlTemplate,
    location.coords.latitude,
    location.coords.longitude,
  );

  if (!mapUrl) {
    return {
      message: baseBody,
      locationStatus: "template-unavailable" as const,
    };
  }

  return {
    message: baseBody ? `${baseBody}\n${mapUrl}` : mapUrl,
    locationStatus: "included" as const,
  };
}

export function EmergencyMessage({ go }: { go: Go }) {
  const [loadState, setLoadState] = useState<MessageLoadState>("loading");
  const [composer, setComposer] = useState<MessageComposerView | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] =
    useState<LocationCompositionStatus>("unavailable");
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    setLoadState("loading");
    setLoadError(null);
    setComposer(null);
    setMessage("");

    const loadMessage = async () => {
      try {
        const result = await getSafetyMessageComposer(controller.signal);
        const composed = await composeEmergencyMessage(result);
        if (disposed) return;

        setComposer(result);
        setMessage(composed.message);
        setLocationStatus(composed.locationStatus);
        setLoadState("success");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (disposed) return;

        setLoadError(error);
        setLoadState("error");
      }
    };

    void loadMessage();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [retryCount]);

  const errorView = getMessageErrorView(loadError);

  const handleErrorAction = () => {
    if (errorView.target) {
      go(errorView.target);
      return;
    }

    setRetryCount((current) => current + 1);
  };

  return (
    <Canvas className="emergency-message" layout="scroll">
      <header className="message-app-header">
        <button
          type="button"
          className="message-header-back"
          onClick={() => go("home")}
          aria-label="홈으로 돌아가기"
        >
          <MdArrowBack aria-hidden="true" />
        </button>
        <div className="message-app-title">
          <h1>새 메시지</h1>
        </div>
        <span className="message-header-more" aria-hidden="true">
          <MdMoreVert />
        </span>
      </header>

      {loadState === "loading" && (
        <section className="message-load-state" aria-live="polite">
          <span className="message-loading-spinner" aria-hidden="true" />
          <h2>긴급 메시지를 준비하고 있습니다.</h2>
          <p>등록된 보호자와 메시지 내용을 불러오는 중입니다.</p>
        </section>
      )}

      {loadState === "error" && (
        <section className="message-load-state error" role="alert">
          <h2>{errorView.title}</h2>
          <p>{errorView.description}</p>
          <button type="button" onClick={handleErrorAction}>
            {errorView.actionLabel}
          </button>
        </section>
      )}

      {loadState === "success" && composer && (
        <>
          <section className="message-recipients" aria-label="메시지 수신자">
            <span className="message-field-label">받는 사람</span>
            <div className="recipient-list">
              {(composer.recipients ?? []).map((contact, index) => {
                const name = contact.name ?? `보호자 ${index + 1}`;

                return (
                  <span
                    className="recipient-chip"
                    key={contact.id ?? `${contact.name}-${index}`}
                  >
                    <span className="recipient-avatar" aria-hidden="true">
                      {name.slice(0, 1)}
                    </span>
                    <span className="recipient-copy">
                      <b>{name}</b>
                      <small>{contact.phone ?? contact.relationship}</small>
                    </span>
                  </span>
                );
              })}
            </div>
          </section>

          <section className="message-thread">
            <div className="message-thread-intro">
              <div className="message-thread-icon" aria-hidden="true">
                <MdSms />
              </div>
              <h2>긴급 메시지가 준비되었습니다.</h2>
              <p>
                이 화면은 가상 문자 화면입니다.
                <br />
                실제 문자가 발송되지 않습니다.
              </p>
              {locationStatus === "included" && (
                <span className="message-demo-badge">
                  현재 위치 좌표를 지도 링크에 적용했습니다.
                </span>
              )}
            </div>
          </section>

          <section className="message-composer" aria-label="긴급 메시지 작성 영역">
            <span className="message-add-icon" aria-hidden="true">
              <MdAdd aria-hidden="true" />
            </span>
            <label className="message-input-wrap">
              <span className="sr-only">긴급 메시지 내용</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-label="긴급 메시지 내용"
                placeholder="메시지 입력"
              />
            </label>
            <button
              type="button"
              className="message-send-button"
              onClick={() => setShowDemoNotice(true)}
              disabled={message.trim().length === 0}
              aria-label="메시지 보내기"
            >
              <MdSend aria-hidden="true" />
            </button>
          </section>
        </>
      )}

      {showDemoNotice && (
        <div className="message-demo-layer" role="dialog" aria-modal="true">
          <div className="message-demo-dialog">
            <h2>모바일 전용 기능입니다.</h2>
            <p>
              웹 데모에서는 실제 문자를 발송하지 않습니다. 모바일 앱에서 이용해
              주세요.
            </p>
            <button type="button" onClick={() => setShowDemoNotice(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </Canvas>
  );
}
