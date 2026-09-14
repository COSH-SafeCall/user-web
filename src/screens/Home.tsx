import "./styles/Home.css";
import { MdAddIcCall, MdHelp, MdSettings } from "react-icons/md";
import { Canvas } from "../components/Canvas";
import type { Go } from "../types";

type HomeProps = {
  go: Go;
};

export function Home({ go }: HomeProps) {
  const canUseEmergencyMessage = false;
  const canShareLocation = false;

  return (
    <Canvas className="home">
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
      <button className="call-main" onClick={() => go("personaUse")}>
        <MdAddIcCall className="call-main-icon" aria-hidden="true" />
      </button>
      <p className="home-status">
        긴급 메시지 기능이{" "}
        {canUseEmergencyMessage ? (
          <b>사용 가능</b>
        ) : (
          <button
            className="home-status-link unavailable"
            onClick={() => go("editContacts")}
            aria-label="비상 연락처 등록 화면으로 이동"
          >
            사용 불가능
          </button>
        )}
        합니다.
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
