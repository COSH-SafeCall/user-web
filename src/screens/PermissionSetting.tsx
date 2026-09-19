import "./styles/PermissionSetting.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";
import { useEffect, useRef, useState } from "react";
import type { PermissionStatus as StoredPermissionStatus } from "../api/contracts";
import {
  requestLocationPermission,
  requestMicrophonePermission,
  toPermissionStatus,
  type BrowserPermissionState,
} from "../utils/browserPermissions";
import { PermissionRow, permissionCopy } from "./PermissionIntro";

type PermissionKind = "MICROPHONE" | "LOCATION";

const permissionNames = {
  MICROPHONE: "microphone",
  LOCATION: "geolocation",
} as const;

function permissionLabel(state: BrowserPermissionState) {
  if (state === "granted") return "허용됨";
  if (state === "denied") return "거부됨";
  if (state === "prompt") return "요청 필요";
  return "확인 필요";
}

export function PermissionSetting({
  go,
  onSavePermissions,
}: {
  go: Go;
  onSavePermissions: (permissions: Array<{
    code: PermissionKind;
    status: StoredPermissionStatus;
  }>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [browserPermissions, setBrowserPermissions] = useState<
    Record<PermissionKind, BrowserPermissionState>
  >({ MICROPHONE: "unknown", LOCATION: "unknown" });

  useEffect(() => {
    let disposed = false;
    let latestRefresh = 0;
    const listeners: Array<{ status: PermissionStatus; update: () => void }> = [];

    const clearListeners = () => {
      listeners.forEach(({ status, update }) => {
        status.removeEventListener("change", update);
      });
      listeners.length = 0;
    };

    const queryPermission = async (code: PermissionKind) => {
      const available =
        code === "MICROPHONE"
          ? Boolean(navigator.mediaDevices?.getUserMedia)
          : Boolean(navigator.geolocation);
      if (!available) {
        return { state: "unsupported" as BrowserPermissionState, status: null };
      }
      if (!navigator.permissions?.query) {
        return { state: "unknown" as BrowserPermissionState, status: null };
      }

      try {
        const status = await navigator.permissions.query({
          name: permissionNames[code] as PermissionName,
        });
        return { state: status.state as BrowserPermissionState, status };
      } catch {
        return { state: "unknown" as BrowserPermissionState, status: null };
      }
    };

    const refreshPermissions = async () => {
      const refreshId = ++latestRefresh;
      const [microphone, location] = await Promise.all([
        queryPermission("MICROPHONE"),
        queryPermission("LOCATION"),
      ]);
      if (disposed || refreshId !== latestRefresh) return;

      clearListeners();
      const subscribe = (
        code: PermissionKind,
        permissionStatus: PermissionStatus | null,
      ) => {
        if (!permissionStatus) return;
        const update = () => {
          if (disposed) return;
          setBrowserPermissions((current) => ({
            ...current,
            [code]: permissionStatus.state,
          }));
        };
        permissionStatus.addEventListener("change", update);
        listeners.push({ status: permissionStatus, update });
      };

      subscribe("MICROPHONE", microphone.status);
      subscribe("LOCATION", location.status);
      setBrowserPermissions({
        MICROPHONE: microphone.status?.state ?? microphone.state,
        LOCATION: location.status?.state ?? location.state,
      });
    };

    const handleFocus = () => void refreshPermissions();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshPermissions();
    };

    void refreshPermissions();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      clearListeners();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshKey]);

  const updatePermissions = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    try {
      const microphone = await requestMicrophonePermission();

      if (!microphone.granted) {
        await onSavePermissions([
          {
            code: "MICROPHONE",
            status: toPermissionStatus(microphone),
          },
        ]);
        return;
      }

      const location = await requestLocationPermission();

      await onSavePermissions([
        {
          code: "MICROPHONE",
          status: toPermissionStatus(microphone),
        },
        {
          code: "LOCATION",
          status: toPermissionStatus(location),
        },
      ]);
      go("setting");
    } catch {
      // 상위 공통 오류 모달을 표시하고 현재 화면에 머뭅니다.
    } finally {
      savingRef.current = false;
      setSaving(false);
      setRefreshKey((current) => current + 1);
    }
  };

  return (
    <Canvas className="permission-setting" layout="scroll">
      <Header title="권한 허용 여부 변경" back={() => go("setting")} />
      <section>
        <PermissionRow
          icon="mic"
          title="마이크"
          body={permissionCopy.micBody}
          warning={permissionCopy.micWarning}
        />
        <p aria-live="polite">
          현재 브라우저 권한: {permissionLabel(browserPermissions.MICROPHONE)}
        </p>
        <PermissionRow
          icon="location_on"
          title="위치"
          body={permissionCopy.locationBody}
          warning={permissionCopy.locationWarning}
        />
        <p aria-live="polite">
          현재 브라우저 권한: {permissionLabel(browserPermissions.LOCATION)}
        </p>
        {(browserPermissions.MICROPHONE === "denied" ||
          browserPermissions.LOCATION === "denied") && (
          <p className="permission-setting-help">
            차단된 권한은 브라우저 주소창의 사이트 설정에서 허용한 뒤 다시
            시도해주세요.
          </p>
        )}
      </section>
      <BottomButton
        label={saving ? "저장 중..." : "권한 설정하기"}
        onClick={() => void updatePermissions()}
        disabled={saving}
        immediate
      />
    </Canvas>
  );
}


