import "./styles/PermissionSetting.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";
import { useState } from "react";
import type { PermissionStatus, PermissionView } from "../api/contracts";
import {
  requestLocationPermission,
  requestMicrophonePermission,
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
    status: PermissionStatus;
  }>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const updatePermissions = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const [microphone, location] = await Promise.all([
        requestMicrophonePermission(),
        requestLocationPermission(),
      ]);
      await onSavePermissions([
        {
          code: "MICROPHONE",
          status: microphone.granted ? "GRANTED" : "DENIED",
        },
        {
          code: "LOCATION",
          status: location.granted ? "GRANTED" : "DENIED",
        },
      ]);
      go("setting");
    } catch {
      // 상위 공통 오류 모달을 표시하고 현재 화면에 머뭅니다.
    } finally {
      setSaving(false);
    }
  };

  const permissionStatus = (code: "MICROPHONE" | "LOCATION") => {
    const status = permissions.find((item) => item.code === code)?.status;
    if (status === "GRANTED") return "허용됨";
    if (status === "DENIED") return "거부됨";
    return "확인 필요";
  };
  return (
    <Canvas className="permission-setting">
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


