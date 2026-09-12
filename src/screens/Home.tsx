import { MdAddIcCall } from "react-icons/md";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import type { Go } from "../types";

type HomeProps = {
  go: Go;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

export function Home({ go, drawerOpen, setDrawerOpen }: HomeProps) {
  return (
    <Canvas className="home">
      <button className="home-settings" onClick={() => go("setting")}>
        <Icon name="settings" size={30} />
      </button>
      <button className="home-help" onClick={() => go("help")}>
        <Icon name="help" size={32} />
      </button>
      <section className="home-copy">
        <h1>눌러서 AI 안심통화를 시작하세요</h1>
        <p>가상 통화는 실제 신고나 구조를 대신하지 않습니다.</p>
      </section>
      <button className="call-main" onClick={() => go("personaUse")}>
        <MdAddIcCall className="call-main-icon" aria-hidden="true" />
      </button>
      <p className="home-status">
        긴급 메시지 기능이 <b>사용 가능</b>합니다.<br />
        긴급 메시지 위치 전송이 <em>사용 불가</em>합니다.
      </p>
      <button
        className={`drawer-handle ${drawerOpen ? "open" : "closed"}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <span />
      </button>
      {drawerOpen && (
        <section className="home-drawer" onClick={() => setDrawerOpen(false)}>
          <p>
            전원 버튼을 5번 연속으로 눌러 <b>긴급 호출 기능</b>을
            실행시킬 수 있습니다.
            <br />
            <br />
            하단 볼륨 버튼을 3초 이상 눌러 <b>긴급 문자 보내기 기능</b>을
            실행시킬 수 있습니다.
            <br />
            <br />
            긴급 호출 기능(긴급 SOS 기능)은 SafeCall 과 별개로 항상
            작동되니 실수로 실행시키지 않도록 주의해 주십시오. 긴급 문자
            보내기 기능은 앱 실행중에만 실행 가능합니다.
          </p>
        </section>
      )}
    </Canvas>
  );
}
