import "../components/styles/Avatar.css";
import "./styles/Setting.css";
import { MdPerson } from "react-icons/md";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { SettingBlock } from "../components/SettingBlock";
import type { Go, Screen } from "../types";

const settingBlockNames = [
  [
    "사용자 정보 수정",
    "비상 연락처 수정",
    "가상 통화 수신 벨소리 설정",
    "위치 권한 허용 여부 변경",
    "시험 긴급 메시지 보내기",
  ],
  ["도움말", "문의하기"],
  ["개인정보 정책"],
  ["탈퇴하기"],
];

const settingRoutes: Record<string, Screen> = {
  "사용자 정보 수정": "editProfile",
  "비상 연락처 수정": "editContacts",
  "가상 통화 수신 벨소리 설정": "soundSetting",
  "위치 권한 허용 여부 변경": "permissionSetting",
  "시험 긴급 메시지 보내기": "setting",
  도움말: "help",
  문의하기: "settingDialog",
  "개인정보 정책": "terms",
  탈퇴하기: "withdraw",
};

export function Setting({ go, dialog }: { go: Go; dialog?: boolean }) {
  const selectSetting = (name: string) => go(settingRoutes[name]);

  return (
    <Canvas className="setting">
      <div className={dialog ? "dimmed" : ""}>
        <Header title="설정" back={() => go("home")} />
        <section className="setting-profile">
          <div className="avatar">
            <MdPerson className="profile-person-icon" aria-hidden="true" />
          </div>
          <div>
            <b>이름</b>
            <span>카카오 로그인</span>
          </div>
        </section>
        <section className="setting-groups">
          {settingBlockNames.map((names) => (
            <SettingBlock
              key={names.join("-")}
              names={names}
              onSelect={selectSetting}
            />
          ))}
        </section>
      </div>
      <footer>
        <b>team. COSH</b>
        <button onClick={() => go("settingDialog")}>로그아웃</button>
      </footer>
      {dialog && (
        <div className="logout-modal">
          <h2>로그아웃 하시겠습니까?</h2>
          <p>로그아웃 시에도 안심통화 기능은 사용 가능합니다.</p>
          <div>
            <button onClick={() => go("setting")}>취소</button>
            <button onClick={() => go("login")}>로그아웃</button>
          </div>
        </div>
      )}
    </Canvas>
  );
}
