import "./styles/PermissionSetting.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";
import { useRef, useState } from "react";
import type { PermissionStatus as StoredPermissionStatus } from "../api/contracts";
import {
  requestLocationPermission,
  requestMicrophonePermission,
  toPermissionStatus,
} from "../utils/browserPermissions";
import { PermissionRow, permissionCopy } from "./PermissionIntro";

type PermissionKind = "MICROPHONE" | "LOCATION";

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

  const updatePermissions = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    try {
      const microphone = await requestMicrophonePermission();
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
      if (microphone.granted) go("setting");
    } catch {
      // 상위 공통 오류 모달을 표시하고 현재 화면에 머뭅니다.
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Canvas className="permission-setting" layout="scroll">
      <Header title="권한 허용 설정" back={() => go("setting")} />
      <section>
        <PermissionRow
          icon="mic"
          title="마이크"
          body={permissionCopy.micBody}
          warning={permissionCopy.micWarning}
        />
        <PermissionRow
          icon="location_on"
          title="위치"
          body={permissionCopy.locationBody}
          warning={permissionCopy.locationWarning}
        />
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


