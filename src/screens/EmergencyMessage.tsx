import "./styles/EmergencyMessage.css";
import { useEffect, useState } from "react";
import { MdAdd, MdCheckCircle, MdLocationOn, MdSend } from "react-icons/md";
import {
  getSafetyMessageComposer,
  MessageComposerError,
  type MessageComposerView,
} from "../api/messageApi";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
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

function getLocationStatusMessage(status: LocationCompositionStatus) {
  const messages: Record<LocationCompositionStatus, string> = {
    included: "현재 위치 좌표를 지도 링크에 적용했습니다.",
    "permission-denied":
      "위치 권한이 허용되지 않아 API 메시지 본문만 사용합니다.",
    "template-unavailable":
      "사용 가능한 지도 템플릿이 없어 API 메시지 본문만 사용합니다.",
    "unsupported-coordinate-system":
      "지원하지 않는 좌표계라 API 메시지 본문만 사용합니다.",
    unavailable:
      "현재 위치를 확인하지 못해 API 메시지 본문만 사용합니다.",
  };

  return messages[status];
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
    <Canvas className="emergency-message">
      <Header title="새 긴급 메시지" back={() => go("home")} />

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
              {(composer.recipients ?? []).map((contact, index) => (
                <span
                  className="recipient-chip"
                  key={contact.id ?? `${contact.name}-${index}`}
                >
                  {contact.name ?? `보호자 ${index + 1}`}
                  <small>{contact.relationship ?? contact.phone}</small>
                </span>
              ))}
            </div>
          </section>

          <section className="message-draft-preview">
            <div className="message-demo-badge">API 작성 자료 · 실제 전송 안 됨</div>
            <div className="message-preview-icon" aria-hidden="true">
              <MdCheckCircle />
            </div>
            <h2>긴급 메시지가 자동으로 작성되었습니다.</h2>
            <p>
              {composer.notice ??
                `${composer.identity?.name ?? "사용자"}님의 안심 메시지 작성 자료입니다.`}
            </p>
            <div className="message-location-preview">
              <MdLocationOn aria-hidden="true" />
              <span>{getLocationStatusMessage(locationStatus)}</span>
            </div>
          </section>

          <section className="message-composer" aria-label="긴급 메시지 작성 영역">
            <button
              type="button"
              className="message-add-button"
              aria-label="첨부 항목 추가"
            >
              <MdAdd aria-hidden="true" />
            </button>
            <label className="message-input-wrap">
              <span className="sr-only">긴급 메시지 내용</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-label="긴급 메시지 내용"
              />
            </label>
            <button
              type="button"
              className="message-send-button"
              onClick={() => setShowDemoNotice(true)}
              disabled={message.trim().length === 0}
              aria-label="긴급 메시지 전송 체험"
            >
              <MdSend aria-hidden="true" />
            </button>
          </section>
        </>
      )}

      {showDemoNotice && (
        <div className="message-demo-layer" role="dialog" aria-modal="true">
          <div className="message-demo-dialog">
            <h2>데모 메시지입니다.</h2>
            <p>
              실제 메시지 앱이나 전송 API를 호출하지 않았습니다. 작성 화면만
              체험할 수 있습니다.
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
