import "./styles/BottomDrawer.css";
import { useState } from "react";
import type { Screen } from "../types";

const visibleScreens: Screen[] = ["home", "personaUse", "personaPeople"];

type BottomDrawerProps = {
  screen: Screen;
};

export function BottomDrawer({ screen }: BottomDrawerProps) {
  const [open, setOpen] = useState(false);

  if (!visibleScreens.includes(screen)) {
    return null;
  }

  return (
    <div
      className={`bottom-drawer ${open ? "open" : "closed"} home-drawer${
        screen === "home" ? " with-demo-limits" : ""
      }`}
    >
      <section
        className="bottom-drawer-panel"
        onClick={open ? () => setOpen(false) : undefined}
      >
        <button
          className="bottom-drawer-handle"
          type="button"
          aria-label="하단 드로어 열고 닫기"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(!open);
          }}
        >
          <span />
        </button>
        <div className="bottom-drawer-content">
          <p>
            전원 버튼을 5번 연속으로 눌러 <b>긴급 호출 기능</b>을 실행시킬 수
            있습니다.
            <br />
            <br />
            긴급 호출 기능(긴급 SOS 기능)은 SafeCall 과 별개로 항상 작동되니
            실수로 실행시키지 않도록 주의해 주십시오.
          </p>
          {screen === "home" && (
            <p className="bottom-drawer-demo-limit">
              웹 데모 안심 통화는 약 1분간 체험할 수 있습니다.
              <br />
              통화 요청은 게스트 하루 최대 2회, 로그인 사용자는 하루 최대
              3회입니다.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

