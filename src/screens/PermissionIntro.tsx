import "./styles/PermissionIntro.css";
import { useEffect, useRef, useState } from "react";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import { useScale } from "../hooks/useScale";
import type { Go, IconName } from "../types";
import type { PermissionStatus as StoredPermissionStatus } from "../api/contracts";
import {
  requestLocationPermission,
  requestMicrophonePermission,
  toPermissionStatus,
  type PermissionRequestResult,
} from "../utils/browserPermissions";

type PermissionIntroProps = {
  go: Go;
  sos: boolean;
  onSavePermissions?: (permissions: Array<{
    code: "MICROPHONE" | "LOCATION";
    status: StoredPermissionStatus;
  }>) => Promise<void>;
};

type PermissionRowProps = {
  icon: IconName;
  title: string;
  body: string;
  warning: string;
};

export const permissionCopy = {
  micBody: [
    "AI와 실시간 통화 이용 도중 음성 입력을 받기 위해",
    "마이크 권한이 필요합니다.",
  ].join(" "),
  micWarning: "마이크 권한을 허용하지 않을 시 서비스 이용이 불가합니다.",
  micFeatureBody: [
    "가상 통화 중 내 음성이 입력될 수 있도록",
    "브라우저 상단바에서 마이크 기능이 켜져 있는지 확인해주세요.",
  ].join(" "),
  micFeatureWarning: [
    "상단바에서 마이크 기능이 꺼져 있으면",
    "AI 안심 통화를 사용할 수 없습니다.",
  ].join(" "),
  locationBody: [
    "긴급 문자에 사용자의 현재 위치 안내 링크를 함께",
    "제공하기 위해 위치 권한이 필요합니다.",
  ].join(" "),
  locationWarning: [
    "위치 권한을 허용하지 않을 시 긴급 문자에 위치 안내",
    "링크가 포함되지 않습니다.",
  ].join(" "),
  sosBody: [
    "앱 사용중이나 AI 안심 통화 서비스를 이용 중에",
    "긴급한 상황 발생 시 안드로이드 시스템에 등록된",
    "긴급번호로 전화를 연결하는 데 필요한 기능입니다.",
  ].join(" "),
  sosWarning: [
    "긴급 SOS 기능은 SafeCall에서 제공하는 기능이 아닌,",
    "안드로이드 시스템 자체에서 제공하는 기능입니다.",
  ].join(" "),
};

function getMicrophoneErrorMessage(result: PermissionRequestResult) {
  if (result.reason === "unsupported") {
    return "현재 브라우저에서 마이크 권한 요청을 지원하지 않습니다. 지원되는 브라우저에서 다시 시도해주세요.";
  }

  if (result.reason === "denied") {
    return "마이크 권한이 거부되었습니다. 브라우저 사이트 설정에서 마이크 권한을 허용해주세요.";
  }

  return "마이크 권한을 확인하지 못했습니다. 마이크 연결 상태를 확인한 뒤 다시 시도해주세요.";
}

function getLocationWarningMessage(result: PermissionRequestResult) {
  if (result.reason === "denied") {
    return "위치 권한이 거부되었습니다. 브라우저 사이트 설정에서 위치 권한을 다시 허용할 수 있습니다.";
  }

  if (result.reason === "unsupported") {
    return "현재 브라우저에서 위치 권한 요청을 지원하지 않아 위치 없이 진행합니다.";
  }

  if (result.reason === "timeout") {
    return "현재 위치 확인 시간이 초과되어 위치 없이 진행합니다. 위치 권한 상태는 거부로 저장하지 않습니다.";
  }

  return "현재 위치를 확인하지 못해 위치 없이 진행합니다. 위치 권한 상태는 거부로 저장하지 않습니다.";
}

export function PermissionIntro({
  go,
  sos,
  onSavePermissions,
}: PermissionIntroProps) {
  const [requesting, setRequesting] = useState(false);
  const requestingRef = useRef(false);
  const [canContinueWithoutLocation, setCanContinueWithoutLocation] =
    useState(false);
  const [permissionMessage, setPermissionMessage] = useState<{
    type: "error" | "warning";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (sos || !navigator.permissions?.query) return;

    let disposed = false;
    let status: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (disposed || !status || requestingRef.current) return;

      if (status.state === "granted") {
        setCanContinueWithoutLocation(false);
        setPermissionMessage(null);
      } else if (status.state === "denied") {
        setCanContinueWithoutLocation(true);
        setPermissionMessage({
          type: "warning",
          text: "위치 권한이 거부되었습니다. 브라우저 사이트 설정에서 위치 권한을 다시 허용할 수 있습니다.",
        });
      }

      if (status.state !== "prompt") {
        void onSavePermissions?.([
          {
            code: "LOCATION",
            status: status.state === "granted" ? "GRANTED" : "DENIED",
          },
        ]).catch(() => {
          // 상위 공통 오류 모달에서 저장 실패를 안내합니다.
        });
      }
    };

    void navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (disposed) return;
        status = permissionStatus;
        status.addEventListener("change", handlePermissionChange);
      })
      .catch(() => {
        // Permissions API를 지원하지 않으면 버튼을 눌렀을 때 다시 확인합니다.
      });

    return () => {
      disposed = true;
      status?.removeEventListener("change", handlePermissionChange);
    };
  }, [onSavePermissions, sos]);

  const handleNext = async () => {
    if (sos) {
      go("complete");
      return;
    }

    if (canContinueWithoutLocation) {
      go("permissionSos");
      return;
    }

    if (requesting) {
      return;
    }

    setRequesting(true);
    requestingRef.current = true;
    setPermissionMessage(null);

    try {
      const microphoneResult = await requestMicrophonePermission();

      if (!microphoneResult.granted) {
        await onSavePermissions?.([
          {
            code: "MICROPHONE",
            status: toPermissionStatus(microphoneResult),
          },
        ]);
        setPermissionMessage({
          type: "error",
          text: getMicrophoneErrorMessage(microphoneResult),
        });
        return;
      }

      const locationResult = await requestLocationPermission();

      await onSavePermissions?.([
        {
          code: "MICROPHONE",
          status: toPermissionStatus(microphoneResult),
        },
        {
          code: "LOCATION",
          status: toPermissionStatus(locationResult),
        },
      ]);

      if (!locationResult.granted) {
        setCanContinueWithoutLocation(true);
        setPermissionMessage({
          type: "warning",
          text: getLocationWarningMessage(locationResult),
        });
        return;
      }

      setCanContinueWithoutLocation(false);
      go("permissionSos");
    } catch {
      // 상위 공통 오류 모달을 표시하고 현재 화면에 머뭅니다.
    } finally {
      setRequesting(false);
      requestingRef.current = false;
    }
  };

  return (
    <Canvas className="permission" layout="scroll" style={useScale()}>
      <h1>
        {sos
          ? "SafeCall 이용을 위해 아래의 기능이 켜져 있는지 확인해주세요."
          : "SafeCall 이용을 위해 아래의 권한을 허용해주세요."}
      </h1>
      <section className="permission-list">
        <PermissionRow
          icon="mic"
          title="마이크"
          body={sos ? permissionCopy.micFeatureBody : permissionCopy.micBody}
          warning={
            sos ? permissionCopy.micFeatureWarning : permissionCopy.micWarning
          }
        />
        {!sos && (
          <PermissionRow
            icon="location_on"
            title="위치"
            body={permissionCopy.locationBody}
            warning={permissionCopy.locationWarning}
          />
        )}
        {sos && (
          <PermissionRow
            icon="mic"
            title="긴급 SOS"
            body={permissionCopy.sosBody}
            warning={permissionCopy.sosWarning}
          />
        )}
      </section>
      <p className="sos-warning">
        실제 119나 112에 신고가 갈 수 있으므로, SafeCall은 112 긴급 호출
        기능을 제어할 수 없으므로 신중한 사용을 권장합니다.
      </p>
      {permissionMessage && (
        <p className={`permission-message ${permissionMessage.type}`}>
          {permissionMessage.text}
        </p>
      )}
      <BottomButton
        label={
          requesting
            ? "권한 요청 중..."
            : canContinueWithoutLocation
              ? "위치 없이 다음"
              : "다음"
        }
        onClick={handleNext}
        disabled={requesting}
        immediate
      />
    </Canvas>
  );
}

export function PermissionRow({
  icon,
  title,
  body,
  warning,
}: PermissionRowProps) {
  return (
    <div className="permission-row">
      <div className="round-icon">
        <Icon name={icon} size={28} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
        <b>{warning}</b>
      </div>
    </div>
  );
}
