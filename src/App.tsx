import { useMemo, useState } from "react";
import logo from "./assets/Safecall_logo.png";
import kakaoMock from "./assets/screen-reference/Login - Onboarding-1.png";
import sosMock from "./assets/screen-reference/Login - Onboarding-7.png";
import callPermissionMock from "./assets/screen-reference/Login - Onboarding-8.png";
import completeGradient from "./assets/figma/onboarding-complete-gradient.png";
import father from "./assets/figma/raw-image-1.jpeg";
import mother from "./assets/figma/raw-image-3.jpeg";
import friend from "./assets/figma/raw-image-5.jpeg";

type Screen =
  | "login" | "kakao" | "profile" | "contacts" | "contactModal" | "terms"
  | "permissionBasic" | "permissionSos" | "sosSystem" | "callPermission" | "permissionToast"
  | "complete" | "personaUse" | "personaPeople" | "callSetupCheck" | "voiceLoading"
  | "home" | "help" | "helpOpen" | "callRinging" | "call" | "setting" | "settingDialog" | "withdraw"
  | "editProfile" | "editContacts" | "soundSetting" | "permissionSetting";

type Go = (screen: Screen) => void;

type IconName =
  | "chat" | "mic" | "location_on" | "directions_walk" | "directions_car" | "business_center"
  | "groups" | "person" | "settings" | "help" | "phone" | "call_end" | "notifications"
  | "volume_up" | "volume_off" | "vibration" | "wifi_off" | "videocam" | "bluetooth"
  | "speaker" | "mic_off" | "dialpad" | "sms" | "keyboard_arrow_left" | "keyboard_arrow_right"
  | "chevron_right" | "expand_less" | "add" | "logout";

const order: Screen[] = [
  "login", "kakao", "permissionToast", "profile", "contacts", "contactModal", "terms",
  "permissionBasic", "callPermission", "permissionSos", "sosSystem", "complete",
  "home", "personaUse", "personaPeople", "callSetupCheck", "voiceLoading",
  "callRinging", "call", "help", "helpOpen", "setting", "settingDialog", "withdraw", "editProfile",
  "editContacts", "soundSetting", "permissionSetting",
];

const W = 402;
const H = 874;
const A = "#6366F1";
const CARD = "#202B3D";
const Y = "#FFE100";

function useScale(max = 1.15, min = 0.82) {
  return useMemo(() => ({
    "--screen-w": `${W}px`,
    "--screen-h": `${H}px`,
    "--scale-max": String(max),
    "--scale-min": String(min),
  }) as React.CSSProperties, [max, min]);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [personaUse, setPersonaUse] = useState(0);
  const [personaPeople, setPersonaPeople] = useState(0);
  const [soundMode, setSoundMode] = useState("소리");
  const [homeDrawerOpen, setHomeDrawerOpen] = useState(true);

  const go: Go = (next) => setScreen(next);
  const next = () => go(order[(order.indexOf(screen) + 1) % order.length]);

  return (
    <div className="app-root">
      <div className="desktop-shell">
        <div className="phone-frame">
          {screen === "login" && <Login go={go} />}
          {screen === "kakao" && <ImageScreen src={kakaoMock} onClick={() => go("permissionToast")} />}
          {screen === "profile" && <Profile go={go} />}
          {screen === "contacts" && <Contacts go={go} />}
          {screen === "contactModal" && <Contacts go={go} modal />}
          {screen === "terms" && <Terms go={go} />}
          {screen === "permissionBasic" && <PermissionIntro go={go} sos={false} />}
          {screen === "permissionSos" && <PermissionIntro go={go} sos />}
          {screen === "sosSystem" && <ImageScreen src={sosMock} onClick={() => go("complete")} />}
          {screen === "callPermission" && <ImageScreen src={callPermissionMock} onClick={() => go("permissionSos")} />}
          {screen === "permissionToast" && <Profile go={go} kakaoFailure />}
          {screen === "complete" && <Complete go={go} />}
          {screen === "personaUse" && <PersonaUse go={go} selected={personaUse} setSelected={setPersonaUse} />}
          {screen === "personaPeople" && <PersonaPeople go={go} selected={personaPeople} setSelected={setPersonaPeople} />}
          {screen === "callSetupCheck" && <CallSetupCheck go={go} />}
          {screen === "voiceLoading" && <VoiceLoading go={go} />}
          {screen === "home" && <Home go={go} drawerOpen={homeDrawerOpen} setDrawerOpen={setHomeDrawerOpen} />}
          {screen === "help" && <HelpScreen go={go} />}
          {screen === "helpOpen" && <HelpScreen go={go} open />}
          {screen === "callRinging" && <CallRinging go={go} />}
          {screen === "call" && <Call go={go} />}
          {screen === "setting" && <Setting go={go} />}
          {screen === "settingDialog" && <Setting go={go} dialog />}
          {screen === "withdraw" && <Withdraw go={go} />}
          {screen === "editProfile" && <Profile go={go} edit />}
          {screen === "editContacts" && <Contacts go={go} edit />}
          {screen === "soundSetting" && <SoundSetting go={go} mode={soundMode} setMode={setSoundMode} />}
          {screen === "permissionSetting" && <PermissionSetting go={go} />}
          <button className="hidden-next" onClick={next} aria-label="다음 화면 테스트" />
        </div>
      </div>
    </div>
  );
}

function Canvas({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <main className={`canvas ${className}`} style={style}>{children}</main>;
}

function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <span className={`material-symbols-rounded icon ${className}`} style={{ fontSize: size }}>{name}</span>;
}

function ImageScreen({ src, onClick }: { src: string; onClick: () => void }) {
  return (
    <Canvas className="image-screen">
      <button className="image-button" onClick={onClick}><img src={src} alt="mock" /></button>
    </Canvas>
  );
}

function Header({ title, back }: { title: string; back: () => void }) {
  return (
    <header className="header">
      <button className="icon-button" onClick={back}><Icon name="keyboard_arrow_left" size={28} /></button>
      <h1>{title}</h1>
    </header>
  );
}

function BottomButton({ label, onClick, dark, light }: { label: string; onClick: () => void; dark?: boolean; light?: boolean }) {
  return <button className={`bottom-button ${dark ? "dark" : ""} ${light ? "light" : ""}`} onClick={onClick}>{label}</button>;
}

function Login({ go }: { go: Go }) {
  return (
    <Canvas className="login" style={useScale()}>
      <section className="login-brand">
        <img src={logo} alt="SafeCall" className="login-logo" />
        <p>내 손 안의 안심 통화 서비스</p>
        <h1>SafeCall</h1>
      </section>
      <section className="login-actions">
        <button className="kakao-button" onClick={() => go("kakao")}><Icon name="chat" size={18} />카카오 로그인<span /></button>
        <button className="guest-button" onClick={() => go("home")}>로그인 없이 빠르게 사용하기</button>
      </section>
    </Canvas>
  );
}

function Profile({ go, edit, kakaoFailure }: { go: Go; edit?: boolean; kakaoFailure?: boolean }) {
  return (
    <Canvas className="profile" style={useScale()}>
      {edit && <Header title="사용자 정보 수정" back={() => go("setting")} />}
      <div className={`profile-form ${edit ? "edit" : ""}`}>
        <ProfileField label="이름" value="김이름" help="긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데 사용됩니다." />
        <ProfileField label="전화번호" value="010-0000-0000" help={<>긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데 사용됩니다.<br />전화번호는 가운데 네 자리를 가린 형태로 안내됩니다.</>} />
        <ProfileField label="생년월일" value="2026.09.06" />
        <p className="field-label">성별</p>
        <div className="segment"><span>남자</span><span className="selected">여자</span></div>
      </div>
      <BottomButton label={edit ? "저장하기" : "다음"} onClick={() => go(edit ? "setting" : "contacts")} />
      {kakaoFailure && (
        <div className="modal-layer kakao-fail">
          <div className="dim" />
          <div className="small-modal">
            <b>카카오 로그인에 실패하였습니다.</b>
            <p>네트워크 연결을 확인하시고 다시 시도해주세요.</p>
            <button onClick={() => go("profile")}>확인</button>
          </div>
        </div>
      )}
    </Canvas>
  );
}

function ProfileField({ label, value, help }: { label: string; value: string; help?: React.ReactNode }) {
  return <div className="profile-field"><p className="field-label">{label}</p><strong>{value}</strong><div className="line" />{help && <small>{help}</small>}</div>;
}

function Contacts({ go, modal, edit }: { go: Go; modal?: boolean; edit?: boolean }) {
  return (
    <Canvas className="contacts" style={useScale()}>
      {edit && <Header title="비상 연락처 수정" back={() => go("setting")} />}
      {!edit && <div className="contact-copy"><h1>긴급 연락처를 입력해주세요.</h1><p>저장된 연락처로 긴급 연락(현재 내 위치를 전송합니다)을 발송할 수 있습니다. 최대 2명까지 입력 가능합니다.</p><b>{modal ? "• " : ""}연락처를 아무것도 입력하지 않을 시 긴급 연락 기능을 사용할 수 없습니다</b></div>}
      <section className={`contact-area ${modal ? "under-modal" : ""} ${edit ? "edit" : ""}`}>
        <ContactCard />
        <button className="plus" onClick={() => go("contactModal")}><Icon name="add" size={40} /></button>
      </section>
      {!edit && <BottomButton label="다음" onClick={() => go("terms")} />}
      {modal && <div className="modal-layer"><ContactModal go={go} /></div>}
    </Canvas>
  );
}

function ContactCard() {
  return <div className="contact-card"><div className="avatar"><Icon name="person" size={42} /></div><div><b>보호자 1</b><span>관계</span></div></div>;
}

function ContactModal({ go }: { go: Go }) {
  return (
    <div className="contact-modal">
      <h2>연락처 추가</h2>
      <ModalField label="이름" value="홍길동" />
      <ModalField label="관계" value="가족" />
      <ModalField label="전화번호" value="010-0000-0000" />
      <button onClick={() => go("contacts")}>추가</button>
    </div>
  );
}

function ModalField({ label, value }: { label: string; value: string }) {
  return <label className="modal-field"><span>{label}</span><input defaultValue={value} /></label>;
}

function Terms({ go }: { go: Go }) {
  return (
    <Canvas className="terms" style={useScale()}>
      <h1>개인정보 처리 및 AI 통화 동의</h1>
      <div className="terms-body">{[1, 2, 3, 4].map((n) => <p key={n}>개인정보 처리 동의 내용입니다. 개인정보 처리 원칙, 이용 목적, 보관 기간과 파기 절차를 안내합니다. SafeCall은 긴급 연락과 AI 통화 시나리오 구성을 위해 필요한 최소 정보를 사용합니다.</p>)}</div>
      <label className="agree"><span />위 사항에 동의하십니까?</label>
      <BottomButton label="다음" onClick={() => go("permissionBasic")} />
    </Canvas>
  );
}

function PermissionIntro({ go, sos }: { go: Go; sos: boolean }) {
  return (
    <Canvas className="permission" style={useScale()}>
      <h1>SafeCall 이용을 위해 아래의 기능이 켜져 있는지 확인해주세요.</h1>
      <section className="permission-list">
        <PermissionRow icon="mic" title="마이크" body="AI와 실시간 통화 이용 도중 음성 입력을 받기 위해 마이크 권한이 필요합니다." warning="마이크 권한을 허용하지 않을 시 서비스 이용이 불가합니다." />
        {!sos && <PermissionRow icon="location_on" title="위치" body="긴급 문자에 사용자의 현재 위치 안내 링크를 함께 제공하기 위해 위치 권한이 필요합니다." warning="위치 권한을 허용하지 않을 시 긴급 문자에 위치 안내 링크가 포함되지 않습니다." />}
        {sos && <PermissionRow icon="mic" title="긴급 SOS" body="앱 사용중이나 AI 안심 통화 서비스를 이용 중에 긴급한 상황 발생 시 안드로이드 시스템에 등록된 긴급번호로 전화를 연결하는 데 필요한 기능입니다." warning="긴급 SOS 기능은 SafeCall에서 제공하는 기능이 아닌, 안드로이드 시스템 자체에서 제공하는 기능입니다." />}
      </section>
      <p className="sos-warning">실제 119나 112에 신고가 갈 수 있으므로, SafeCall은 112 긴급 호출 기능을 제어할 수 없으므로 신중한 사용을 권장합니다.</p>
      <BottomButton label="다음" onClick={() => go(sos ? "sosSystem" : "callPermission")} />
    </Canvas>
  );
}

function PermissionRow({ icon, title, body, warning }: { icon: IconName; title: string; body: string; warning: string }) {
  return <div className="permission-row"><div className="round-icon"><Icon name={icon} size={28} /></div><div><h2>{title}</h2><p>{body}</p><b>{warning}</b></div></div>;
}

function Complete({ go }: { go: Go }) {
  return (
    <Canvas className="complete" style={{ backgroundImage: `url(${completeGradient})` }}>
      <section><h1>설정이 모두 완료되었습니다.</h1><p>긴급 메시지 설정이 잘 완료되었는지 테스트해볼까요?</p></section>
      <div className="two-buttons"><BottomButton dark label="건너뛰기" onClick={() => go("home")} /><BottomButton light label="확인" onClick={() => go("personaUse")} /></div>
    </Canvas>
  );
}

function Pager({ active }: { active: number }) {
  return <div className="pager">{[0, 1, 2].map((n) => <span key={n} className={active === n ? "active" : ""} />)}</div>;
}

function PersonaUse({ go, selected, setSelected }: { go: Go; selected: number; setSelected: (v: number) => void }) {
  const choices = [
    ["directions_walk", "누군가 따라오는\n것 같아요"],
    ["directions_car", "택시 안이\n불안해요"],
    ["business_center", "낯선 사람이\n근처에 있어요"],
    ["groups", "혼자 귀가하기\n무서워요"],
  ] as const;
  return <PersonaFrame active={0} title="어떤 상황에서 안심 통화를 사용하시나요?" back={() => go("home")} next={() => go("personaPeople")} choices={choices} selected={selected} setSelected={setSelected} />;
}

function PersonaFrame({ active, title, back, next, choices, selected, setSelected }: { active: number; title: string; back: () => void; next: () => void; choices: readonly (readonly [IconName, string])[]; selected: number; setSelected: (v: number) => void }) {
  return (
    <Canvas className="persona" style={useScale()}>
      <div className="persona-top"><button onClick={back}><Icon name="keyboard_arrow_left" size={54} /></button><Pager active={active} /><button onClick={next}><Icon name="keyboard_arrow_right" size={54} /></button></div>
      <h1>{title}</h1>
      <div className="choice-grid">{choices.map(([icon, text], i) => <button className={selected === i ? "selected" : ""} key={text} onClick={() => setSelected(i)}><span><Icon name={icon} size={72} /></span><b>{text}</b></button>)}</div>
      <BottomButton label="다음" onClick={next} />
      <BottomPeek />
    </Canvas>
  );
}

function PersonaPeople({ go, selected, setSelected }: { go: Go; selected: number; setSelected: (v: number) => void }) {
  const people = [[father, "아빠"], [mother, "엄마"], [friend, "친구"]] as const;
  return (
    <Canvas className="persona people" style={useScale()}>
      <div className="persona-top"><button onClick={() => go("personaUse")}><Icon name="keyboard_arrow_left" size={54} /></button><Pager active={1} /><button onClick={() => go("callSetupCheck")}><Icon name="keyboard_arrow_right" size={54} /></button></div>
      <h1>통화하고 싶은 가상의 인물을 선택해주세요.</h1>
      <div className="people-row">{people.map(([img, label], i) => <button key={label} onClick={() => setSelected(i)}><img className={selected === i ? "selected" : ""} src={img} alt={label} /><b>{label}</b></button>)}</div>
      <BottomButton label="다음" onClick={() => go("callSetupCheck")} />
      <BottomPeek />
    </Canvas>
  );
}

function CallSetupCheck({ go }: { go: Go }) {
  return (
    <Canvas className="setup-check" style={useScale()}>
      <Header title="모두 확인하셨나요?" back={() => go("personaPeople")} />
      <div className="check-icons"><div><Icon name="wifi_off" size={72} /><p>와이파이를 끄고 모바일<br />데이터를 사용해주세요</p></div><div><Icon name="volume_up" size={78} /><p>볼륨 4-5로 설정해주세요</p></div></div>
      <p className="check-note">화면을 나가거나 긴급 SOS 통화를 사용할 경우 AI 통화는 자동으로 종료됩니다.</p>
      <BottomButton label="다음" onClick={() => go("voiceLoading")} />
    </Canvas>
  );
}

function VoiceLoading({ go }: { go: Go }) {
  return (
    <Canvas className="voice-loading" style={useScale()}>
      <h1>가상 통화를 준비하고 있습니다...</h1>
      <button className="equalizer" onClick={() => go("callRinging")} aria-label="통화 화면으로 이동"><span /><span /><span /><span /><span /></button>
      <p className="voice-note">AI는 실제로 실행되지 않은 112 신고,<br />긴급 문자 발송 또는 위치 링크 전송이<br />완료됐다고 말하지 않습니다.<br /><br />AI는 사용자를 대신해 위험 여부를<br />판단하거나 긴급 문자 발송 또는<br />112 신고를 실행하지 않습니다.<br /><br />AI는 사용자에게 위험 인물과 대치,<br />추적 또는 촬영을 유도하지 않습니다.</p>
    </Canvas>
  );
}

function Home({ go, drawerOpen, setDrawerOpen }: { go: Go; drawerOpen: boolean; setDrawerOpen: (v: boolean) => void }) {
  return (
    <Canvas className="home" style={useScale()}>
      <button className="top-left" onClick={() => go("setting")}><Icon name="settings" size={42} /></button>
      <button className="top-right" onClick={() => go("help")}><Icon name="help" size={42} /></button>
      <section className="home-copy"><h1>눌러서 AI 안심통화를 시작하세요</h1><p>가상 통화는 실제 신고나 구조를 대신하지 않습니다.</p></section>
      <button className="big-call" onClick={() => go("personaUse")}><Icon name="phone" size={96} /><span>+</span></button>
      <section className="home-status"><p>긴급 메시지 기능이 <b>사용 가능</b>합니다.</p><p>긴급 메시지 위치 전송이 <em>사용 불가</em>합니다.</p></section>
      <button className={`home-drawer ${drawerOpen ? "open" : "closed"}`} onClick={() => setDrawerOpen(!drawerOpen)}><span /><p>전원 버튼을 5번 연속으로 눌러 <b>긴급 호출 기능</b>을 실행시킬 수 있습니다.<br /><br />하단 볼륨 버튼을 3초 이상 눌러 <b>긴급 문자 보내기 기능</b>을 실행시킬 수 있습니다.<br /><br />긴급 호출 기능(긴급 SOS 기능)은 SafeCall 과 별개로 항상 작동되니 실수로 실행시키지 않도록 주의해 주십시오. 긴급 문자 보내기 기능은 앱 실행중에만 실행 가능합니다.</p></button>
    </Canvas>
  );
}

function HelpScreen({ go, open }: { go: Go; open?: boolean }) {
  const qs = ["SOS 기능을 다시 켜고 싶어요.", "긴급 연락처를 수정하고 싶어요.", "긴급 연락처를 입력하지 않아도 괜찮은가요?", "가상 전화를 소리 말고 진동이나 무음으로 받고 싶어요.", "음량 조절이 필수적인가요?"];
  return <Canvas className="help-screen"><Header title="도움말" back={() => go("setting")} /><div className="help-list">{qs.map((q, i) => <button key={q} onClick={() => go("helpOpen")} className={open && i === 0 ? "open" : ""}><span><b>Q.</b> {q}</span><Icon name={open && i === 0 ? "expand_less" : "chevron_right"} />{open && i === 0 && <p>시스템 설정 &gt; 안전 및 긴급 &gt; 긴급 SOS에서 해당 기능을 끌 수 있습니다.</p>}</button>)}</div></Canvas>;
}

function CallRinging({ go }: { go: Go }) {
  return (
    <Canvas className="call-gradient ringing" style={useScale(1, 0.82)}>
      <section className="ring-title"><p>수신전화</p><h1>아빠</h1><img src={father} alt="아빠" /></section>
      <section className="ring-notice"><Icon name="notifications" size={15} /><p>안심통화는<br />실제 신고나 구조를<br />대신하지 않습니다.</p></section>
      <div className="ring-actions"><button className="answer" onClick={() => go("call")}><Icon name="phone" size={34} /></button><button className="decline" onClick={() => go("home")}><Icon name="call_end" size={34} /></button></div>
    </Canvas>
  );
}

function Call({ go }: { go: Go }) {
  const actions: [IconName, string][] = [["sms", "녹음"], ["videocam", "영상통화"], ["bluetooth", "블루투스"], ["speaker", "스피커"], ["mic_off", "내 소리 차단"], ["dialpad", "키패드"]];
  return (
    <Canvas className="call-gradient call-active" style={useScale(1, 0.82)}>
      <p className="call-time">00:00</p><h1>아빠</h1><p className="call-hint">미리 녹음된 음성을 재생합니다.</p><button className="alt-call">대체통화</button>
      <section className="call-pad">{actions.map(([icon, label]) => <button key={label}><Icon name={icon} size={34} /><span>{label}</span></button>)}<button className="end" onClick={() => go("home")}><Icon name="call_end" size={35} /></button></section>
      <p className="call-bottom">통화 종료를 제외한 나머지 기능은 실제 제공되는 기능이 아닙니다.</p>
    </Canvas>
  );
}

function Setting({ go, dialog }: { go: Go; dialog?: boolean }) {
  return (
    <Canvas className="setting"><div className={dialog ? "dimmed" : ""}><Header title="설정" back={() => go("home")} /><section className="setting-profile"><div className="avatar"><Icon name="person" size={42} /></div><div><b>이름</b><span>카카오 로그인</span></div></section><section className="setting-groups"><SettingGroup rows={[["사용자 정보 수정", "editProfile"], ["비상 연락처 수정", "editContacts"], ["가상 통화 수신 벨소리 설정", "soundSetting"], ["위치 권한 허용 여부 변경", "permissionSetting"], ["시험 긴급 메시지 보내기", "setting"]]} go={go} /><SettingGroup rows={[["도움말", "help"], ["문의하기", "settingDialog"]]} go={go} /><SettingGroup rows={[["개인정보 정책", "terms"]]} go={go} /><SettingGroup rows={[["탈퇴하기", "withdraw"]]} go={go} /></section></div><footer><b>team. Cesh</b><button onClick={() => go("settingDialog")}>로그아웃</button></footer>{dialog && <div className="logout-modal"><h2>로그아웃 하시겠습니까?</h2><p>로그아웃 시에도 안심통화 기능은 사용 가능합니다.</p><div><button onClick={() => go("setting")}>취소</button><button onClick={() => go("login")}>로그아웃</button></div></div>}</Canvas>
  );
}

function SettingGroup({ rows, go }: { rows: [string, Screen][]; go: Go }) {
  return <div className="setting-group">{rows.map(([label, screen]) => <button key={label} onClick={() => go(screen)}><span>{label}</span><Icon name="chevron_right" /></button>)}</div>;
}

function SoundSetting({ go, mode, setMode }: { go: Go; mode: string; setMode: (v: string) => void }) {
  const modes: [string, IconName][] = [["소리", "volume_up"], ["진동", "vibration"], ["무음", "volume_off"]];
  return <Canvas className="sound-setting"><Header title="가상 통화 수신 벨소리 설정" back={() => go("setting")} /><section className="sound-card"><p>수신 방식</p><div>{modes.map(([title, icon]) => <button key={title} onClick={() => setMode(title)}><Icon name={icon} /><span>{title}</span><i className={mode === title ? "on" : ""} /></button>)}</div></section><button className="ringtone"><span><b>벨소리</b><small>Over the Horizon</small></span><Icon name="chevron_right" /></button></Canvas>;
}

function PermissionSetting({ go }: { go: Go }) {
  return <Canvas className="permission-setting"><Header title="위치 권한 허용 여부 변경" back={() => go("setting")} /><section><PermissionRow icon="mic" title="마이크" body="AI와 실시간 통화 이용 도중 음성 입력을 받기 위해 마이크 권한이 필요합니다." warning="마이크 권한을 허용하지 않을 시 서비스 이용이 불가합니다." /><PermissionRow icon="location_on" title="위치" body="긴급 문자에 사용자의 현재 위치 안내 링크를 함께 제공하기 위해 위치 권한이 필요합니다." warning="위치 권한을 허용하지 않을 시 긴급 문자에 위치 안내 링크가 포함되지 않습니다." /></section><BottomButton label="권한 설정하기" onClick={() => go("sosSystem")} /></Canvas>;
}

function Withdraw({ go }: { go: Go }) {
  return <Canvas className="withdraw"><Header title="탈퇴하기" back={() => go("setting")} /><p>탈퇴하는 즉시 서버에 저장된 개인정보가 삭제됩니다. 추후 로그인 서비스 이용을 원하실 경우 다시 가입을 진행하여야 합니다. 탈퇴하시겠습니까?</p><div className="two-buttons"><BottomButton dark label="취소" onClick={() => go("setting")} /><BottomButton label="탈퇴하기" onClick={() => go("login")} /></div></Canvas>;
}

function BottomPeek() {
  return <div className="bottom-peek"><span /></div>;
}

