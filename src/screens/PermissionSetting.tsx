import "./styles/PermissionSetting.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";
import { useEffect, useRef, useState } from "react";
import type {
  PermissionStatus as StoredPermissionStatus,
  PermissionView,
} from "../api/contracts";
import {
  requestLocationPermission,
  requestMicrophonePermission,
  toPermissionStatus,
} from "../utils/browserPermissions";
import { PermissionRow, permissionCopy } from "./PermissionIntro";

export function PermissionSetting({
  go,
  permissions,
  onSavePermissions,
}: {
  go: Go;
  permissions: PermissionView[];
  onSavePermissions: (permissions: Array<{
    code: "MICROPHONE" | "LOCATION";
    status: StoredPermissionStatus;
  }>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!navigator.permissions?.query) return;

    let disposed = false;
    let status: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (
        disposed ||
        !status ||
        status.state === "prompt" ||
        savingRef.current
      ) {
        return;
      }

      void onSavePermissions([
        {
          code: "LOCATION",
          status: status.state === "granted" ? "GRANTED" : "DENIED",
        },
      ]).catch(() => {
        // 상위 공통 오류 모달에서 저장 실패를 안내합니다.
      });
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
  }, [onSavePermissions]);

  const updatePermissions = async () => {
    if (saving) return;
    setSaving(true);
    savingRef.current = true;

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
      setSaving(false);
      savingRef.current = false;
    }
  };

  const permissionStatus = (code: "MICROPHONE" | "LOCATION") => {
    const status = permissions.find((item) => item.code === code)?.status;
    if (status === "GRANTED") return "허용됨";
    if (status === "DENIED") return "거부됨";
    return "확인 필요";
  };
  return (
    <Canvas className="permission-setting" layout="scroll">
      <Header title="위치 권한 허용 여부 변경" back={() => go("setting")} />
      <section>
        <PermissionRow
          icon="mic"
          title="마이크"
          body={permissionCopy.micBody}
          warning={permissionCopy.micWarning}
        />
        <p>현재 저장 상태: {permissionStatus("MICROPHONE")}</p>
        <PermissionRow
          icon="location_on"
          title="위치"
          body={permissionCopy.locationBody}
          warning={permissionCopy.locationWarning}
        />
        <p>현재 저장 상태: {permissionStatus("LOCATION")}</p>
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


