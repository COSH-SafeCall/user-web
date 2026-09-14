import "./styles/PermissionSetting.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";
import { PermissionRow, permissionCopy } from "./PermissionIntro";

export function PermissionSetting({ go }: { go: Go }) {
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
        <PermissionRow
          icon="location_on"
          title="위치"
          body={permissionCopy.locationBody}
          warning={permissionCopy.locationWarning}
        />
      </section>
      <BottomButton
        label="권한 설정하기"
        onClick={() => go("setting")}
      />
    </Canvas>
  );
}


