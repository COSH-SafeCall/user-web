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
    <div className={`bottom-drawer ${open ? "open" : "closed"} home-drawer`}>
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
            실수로 실행시키지 않도록 주의해 주십시오. 긴급 문자 보내기 기능은
            앱 실행중에만 실행 가능합니다.
          </p>
        </div>
      </section>
    </div>
  );
}

