import "./App.css";
import { useRef, useState } from "react";
import { BottomDrawer } from "./components/BottomDrawer";
import { screenOrder } from "./screenOrder";
import { Call } from "./screens/Call";
import { CallRinging } from "./screens/CallRinging";
import { CallSetupCheck } from "./screens/CallSetupCheck";
import { Complete } from "./screens/Complete";
import { Contacts, type EmergencyContact } from "./screens/Contacts";
import { DeletionStatus } from "./screens/DeletionStatus";
import { EmergencyMessage } from "./screens/EmergencyMessage";
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

type ScreenFlow = "onboarding" | "home" | "setting" | "help";
type ScreenTransition = "same-flow" | "flow-change";

function getScreenFlow(screen: Screen): ScreenFlow {
  if (screen === "help") {
    return "help";
  }

  if (
    screen === "setting" ||
    screen === "settingDialog" ||
    screen === "withdraw" ||
    screen === "deletionStatus" ||
    screen === "editProfile" ||
    screen === "editContacts" ||
    screen === "soundSetting" ||
    screen === "permissionSetting"
  ) {
    return "setting";
  }

  if (
    screen === "home" ||
    screen === "emergencyMessage" ||
    screen === "personaUse" ||
    screen === "personaPeople" ||
    screen === "callSetupCheck" ||
    screen === "voiceLoading" ||
    screen === "callRinging" ||
    screen === "call"
  ) {
    return "home";
  }

  return "onboarding";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [screenTransition, setScreenTransition] =
    useState<ScreenTransition>("same-flow");
  const [personaUse, setPersonaUse] = useState(0);
  const [personaPeople, setPersonaPeople] = useState(0);
  const [soundMode, setSoundMode] = useState("소리");
  const [ringtone, setRingtone] = useState("잔잔한 벨소리");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const nextContactIdRef = useRef(1);

  const go: Go = (nextScreen) => {
    setScreenTransition(
      getScreenFlow(screen) === getScreenFlow(nextScreen)
        ? "same-flow"
        : "flow-change",
    );
    setScreen(nextScreen);
  };
  const next = () =>
    go(screenOrder[(screenOrder.indexOf(screen) + 1) % screenOrder.length]);
  const addContact = (contact: Omit<EmergencyContact, "id">) => {
    if (contacts.length >= 2) {
      return;
    }

    const nextContactId = nextContactIdRef.current;
    nextContactIdRef.current += 1;

    setContacts((current) => {
      if (current.length >= 2) {
        return current;
      }

      return [
        ...current,
        {
          ...contact,
          id: nextContactId,
        },
      ];
    });
  };

  const deleteContact = (contactId: number) => {
    setContacts((current) =>
      current.filter((contact) => contact.id !== contactId),
    );
  };

  const startRegularCall = () => {
    go("personaUse");
  };

  const startQuickCall = (situationIndex: number) => {
    setPersonaUse(situationIndex);
    setPersonaPeople(0);
    go("voiceLoading");
  };

  return (
    <div className="app-root">
      <div className="desktop-shell">
        <div className="phone-frame">
          <div key={screen} className={`screen-stage ${screenTransition}`}>
            {screen === "login" && <Login go={go} />}
            {screen === "profile" && <Profile go={go} />}
            {screen === "contacts" && (
              <Contacts
                go={go}
                contacts={contacts}
                onAddContact={addContact}
                onDeleteContact={deleteContact}
              />
            )}
            {screen === "contactModal" && (
              <Contacts
                go={go}
                contacts={contacts}
                onAddContact={addContact}
                onDeleteContact={deleteContact}
                modal
              />
            )}
            {screen === "terms" && <Terms go={go} />}
            {screen === "permissionBasic" && (
              <PermissionIntro go={go} sos={false} />
            )}
            {screen === "permissionSos" && <PermissionIntro go={go} sos />}
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
                onRegularStart={startRegularCall}
                onQuickStart={startQuickCall}
              />
            )}
            {screen === "emergencyMessage" && <EmergencyMessage go={go} />}
            {screen === "help" && <HelpScreen go={go} />}
            {screen === "callRinging" && <CallRinging go={go} />}
            {screen === "call" && <Call go={go} />}
            {screen === "setting" && <Setting go={go} />}
            {screen === "settingDialog" && <Setting go={go} dialog />}
            {screen === "withdraw" && <Withdraw go={go} />}
            {screen === "deletionStatus" && <DeletionStatus go={go} />}
            {screen === "editProfile" && <Profile go={go} edit />}
            {screen === "editContacts" && (
              <Contacts
                go={go}
                contacts={contacts}
                onAddContact={addContact}
                onDeleteContact={deleteContact}
                edit
              />
            )}
            {screen === "soundSetting" && (
              <SoundSetting
                go={go}
                mode={soundMode}
                setMode={setSoundMode}
                ringtone={ringtone}
                setRingtone={setRingtone}
              />
            )}
            {screen === "permissionSetting" && <PermissionSetting go={go} />}
          </div>
          <BottomDrawer screen={screen} />
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
