import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import { useScale } from "../hooks/useScale";
import type { Go, IconName } from "../types";

type PermissionIntroProps = {
  go: Go;
  sos: boolean;
  kakaoFailure?: boolean;
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

export function PermissionIntro({
  go,
  sos,
  kakaoFailure,
}: PermissionIntroProps) {
  return (
    <Canvas className="permission" style={useScale()}>
      <div className={kakaoFailure ? "dimmed-content" : ""}>
        <h1>
          {sos
            ? "SafeCall 이용을 위해 아래의 기능이 켜져 있는지 확인해주세요."
            : "SafeCall 이용을 위해 아래의 권한을 허용해주세요."}
        </h1>
        <section className="permission-list">
          <PermissionRow
            icon="mic"
            title="마이크"
            body={permissionCopy.micBody}
            warning={permissionCopy.micWarning}
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
        <BottomButton
          label="다음"
          onClick={() => go(sos ? "sosSystem" : "callPermission")}
        />
      </div>
      {kakaoFailure && <KakaoFailureModal onConfirm={() => go("profile")} />}
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

function KakaoFailureModal({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="kakao-error-layer" aria-live="assertive">
      <div className="kakao-error-modal">
        <b>카카오 로그인에 실패하였습니다.</b>
        <p>네트워크 연결을 확인하시고 다시 시도해주세요.</p>
        <button type="button" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  );
}
