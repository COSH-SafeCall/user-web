import { useState } from "react";
import { screenOrder } from "./screenOrder";
import { Call } from "./screens/Call";
import { CallRinging } from "./screens/CallRinging";
import { CallSetupCheck } from "./screens/CallSetupCheck";
import { Complete } from "./screens/Complete";
import { Contacts } from "./screens/Contacts";
import { HelpScreen } from "./screens/HelpScreen";
import { Home } from "./screens/Home";
import { Login } from "./screens/Login";
import { PermissionIntro } from "./screens/PermissionIntro";
import { PermissionSetting } from "./screens/PermissionSetting";
import { PersonaPeople, PersonaUse } from "./screens/Persona";
import { Profile } from "./screens/Profile";
import { Setting } from "./screens/Setting";
import { SoundSetting } from "./screens/SoundSetting";
import { Terms } from "./screens/Terms";
import { VoiceLoading } from "./screens/VoiceLoading";
import { Withdraw } from "./screens/Withdraw";
import type { Go, Screen } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [personaUse, setPersonaUse] = useState(0);
  const [personaPeople, setPersonaPeople] = useState(0);
  const [soundMode, setSoundMode] = useState("소리");
  const [homeDrawerOpen, setHomeDrawerOpen] = useState(true);

  const go: Go = (nextScreen) => setScreen(nextScreen);
  const next = () =>
    go(screenOrder[(screenOrder.indexOf(screen) + 1) % screenOrder.length]);

  return (
    <div className="app-root">
      <div className="desktop-shell">
        <div className="phone-frame">
          {screen === "login" && <Login go={go} />}
          {screen === "profile" && <Profile go={go} />}
          {screen === "contacts" && <Contacts go={go} />}
          {screen === "contactModal" && <Contacts go={go} modal />}
          {screen === "terms" && <Terms go={go} />}
          {screen === "permissionBasic" && (
            <PermissionIntro go={go} sos={false} />
          )}
          {screen === "permissionSos" && <PermissionIntro go={go} sos />}
          {screen === "permissionToast" && (
            <PermissionIntro go={go} sos={false} kakaoFailure />
          )}
          {screen === "complete" && <Complete go={go} />}
          {screen === "personaUse" && (
            <PersonaUse
              go={go}
              selected={personaUse}
              setSelected={setPersonaUse}
            />
          )}
          {screen === "personaPeople" && (
            <PersonaPeople
              go={go}
              selected={personaPeople}
              setSelected={setPersonaPeople}
            />
          )}
          {screen === "callSetupCheck" && <CallSetupCheck go={go} />}
          {screen === "voiceLoading" && <VoiceLoading go={go} />}
          {screen === "home" && (
            <Home
              go={go}
              drawerOpen={homeDrawerOpen}
              setDrawerOpen={setHomeDrawerOpen}
            />
          )}
          {screen === "help" && <HelpScreen go={go} />}
          {screen === "helpOpen" && <HelpScreen go={go} open />}
          {screen === "callRinging" && <CallRinging go={go} />}
          {screen === "call" && <Call go={go} />}
          {screen === "setting" && <Setting go={go} />}
          {screen === "settingDialog" && <Setting go={go} dialog />}
          {screen === "withdraw" && <Withdraw go={go} />}
          {screen === "editProfile" && <Profile go={go} edit />}
          {screen === "editContacts" && <Contacts go={go} edit />}
          {screen === "soundSetting" && (
            <SoundSetting
              go={go}
              mode={soundMode}
              setMode={setSoundMode}
            />
          )}
          {screen === "permissionSetting" && <PermissionSetting go={go} />}
          <button
            className="hidden-next"
            onClick={next}
            aria-label="다음 화면 테스트"
          />
        </div>
      </div>
    </div>
  );
}
