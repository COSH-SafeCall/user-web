import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { BottomDrawer } from "./components/BottomDrawer";
import { ErrorMessage } from "./components/ErrorMessage";
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
import {
  createGuestSession,
  createVirtualSession,
  getSession,
  logout,
} from "./api/sessionApi";
import { getProfile, saveProfile } from "./api/profileApi";
import {
  addContact as addContactApi,
  deleteContact as deleteContactApi,
  getContacts,
} from "./api/contactApi";
import { getPermissions, savePermissions } from "./api/permissionApi";
import { getCallOptions, getHome } from "./api/homeApi";
import { getSettings, saveSettings } from "./api/settingsApi";
import {
  createCall,
  endCall,
  getCall,
  sendCallEvent,
  sendHeartbeat,
} from "./api/callApi";
import { getDeletion, requestAccountDeletion } from "./api/deletionApi";
import { createCallPageKey, toUserMessage } from "./api/httpClient";
import { fixedUserProfile, type FixedEmergencyContact } from "./fixedUserData";
import type {
  CallEndReason,
  CallEventType,
  CallFailureCode,
  CallOptionsView,
  CallStartMode,
  CallView,
  ConnectionView,
  ContactView,
  CounterpartCode,
  DeletionView,
  HomeView,
  IncomingAlertMode,
  PermissionCode,
  PermissionStatus,
  PermissionView,
  ProfileView,
  ScenarioCode,
  SessionView,
  SettingView,
} from "./api/contracts";
import type { Go, Screen } from "./types";

type GeminiLiveConnection = { close: () => void };

type ScreenFlow = "onboarding" | "home" | "setting" | "help";
type ScreenTransition = "same-flow" | "flow-change";

function getScreenFlow(screen: Screen): ScreenFlow {
  if (screen === "help") return "help";
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

function toEmergencyContact(contact: ContactView): EmergencyContact {
  return {
    id: contact.id,
    slot: contact.slot,
    name: contact.name,
    relation: contact.relationship,
    phone: contact.phone,
    version: contact.version,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [screenTransition, setScreenTransition] =
    useState<ScreenTransition>("same-flow");
  const [session, setSession] = useState<SessionView | null>(null);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [permissions, setPermissions] = useState<PermissionView[]>([]);
  const [homeData, setHomeData] = useState<HomeView | null>(null);
  const [callOptions, setCallOptions] = useState<CallOptionsView | null>(null);
  const [setting, setSetting] = useState<SettingView | null>(null);
  const [activeCall, setActiveCall] = useState<CallView | null>(null);
  const [deletion, setDeletion] = useState<DeletionView | null>(null);
  const [scenarioCode, setScenarioCode] =
    useState<ScenarioCode>("FOLLOWED");
  const [counterpartCode, setCounterpartCode] =
    useState<CounterpartCode>("FATHER");
  const [soundMode, setSoundMode] = useState("소리");
  const [ringtone, setRingtone] = useState("잔잔한 벨소리");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const callOptionsCacheRef = useRef<{
    etag: string;
    data: CallOptionsView;
  } | null>(null);
  const callPageKeyRef = useRef("");
  const reportedEventsRef = useRef(new Set<string>());
  const liveConnectionRef = useRef<GeminiLiveConnection | null>(null);
  const terminatingCallRef = useRef(false);

  const go: Go = useCallback((nextScreen) => {
    setScreen((current) => {
      setScreenTransition(
        getScreenFlow(current) === getScreenFlow(nextScreen)
          ? "same-flow"
          : "flow-change",
      );
      return nextScreen;
    });
  }, []);

  const showApiError = useCallback((error: unknown) => {
    setApiError(toUserMessage(error));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    getSession(controller.signal)
      .then((result) => {
        if (ignore) return;
        setSession(result);
        if (result.kind === "MEMBER") go("home");
      })
      .catch((error: unknown) => {
        if (!ignore && !(error instanceof DOMException && error.name === "AbortError")) {
          showApiError(error);
        }
      })
      .finally(() => {
        if (!ignore) setInitializing(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [go, showApiError]);

  useEffect(() => {
    if (!session || !["contacts", "contactModal", "editContacts"].includes(screen)) {
      return;
    }
    const controller = new AbortController();
    getContacts(controller.signal)
      .then((items) => setContacts(items.map(toEmergencyContact)))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showApiError(error);
      });
    return () => controller.abort();
  }, [screen, session, showApiError]);

  useEffect(() => {
    if (!session || !["permissionBasic", "permissionSetting"].includes(screen)) {
      return;
    }
    const controller = new AbortController();
    getPermissions(controller.signal)
      .then(setPermissions)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showApiError(error);
      });
    return () => controller.abort();
  }, [screen, session, showApiError]);

  useEffect(() => {
    if (!session || screen !== "home") return;
    const controller = new AbortController();
    Promise.all([
      getHome(controller.signal),
      getCallOptions(callOptionsCacheRef.current ?? undefined, controller.signal),
    ])
      .then(([nextHome, nextOptions]) => {
        setHomeData(nextHome);
        setCallOptions(nextOptions.data);
        callOptionsCacheRef.current = nextOptions;
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showApiError(error);
      });
    return () => controller.abort();
  }, [screen, session, showApiError]);

  useEffect(() => {
    if (!session || !["setting", "editProfile", "soundSetting"].includes(screen)) return;
    const controller = new AbortController();
    const requests: Promise<unknown>[] = [
      getProfile(controller.signal).then(setProfile),
    ];
    if (screen === "soundSetting" || screen === "setting") {
      requests.push(getSettings(controller.signal).then(setSetting));
    }
    if (screen === "setting") {
      requests.push(
        getContacts(controller.signal).then((items) =>
          setContacts(items.map(toEmergencyContact)),
        ),
      );
    }
    Promise.all(requests).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) showApiError(error);
    });
    return () => controller.abort();
  }, [screen, session, showApiError]);

  useEffect(() => {
    if (!activeCall?.id || !session?.csrfToken) return;
    const controller = new AbortController();
    let timer: number | null = null;
    const callId = activeCall.id;
    const callPageKey = callPageKeyRef.current;

    const heartbeat = async () => {
      try {
        const heartbeatView = await sendHeartbeat(
          { csrfToken: session.csrfToken, callPageKey },
          callId,
          controller.signal,
        );
        if (heartbeatView.state === "ENDED" || heartbeatView.state === "FAILED") {
          setActiveCall(null);
          return;
        }
        setActiveCall((current) =>
          current?.id === callId
            ? {
                ...current,
                state: heartbeatView.state,
                leaseExpiresAt: heartbeatView.leaseExpiresAt,
                expiresAt: heartbeatView.expiresAt,
              }
            : current,
        );
        timer = window.setTimeout(() => void heartbeat(), 5000);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        showApiError(error);
        try {
          const recovered = await getCall(callId, callPageKey, controller.signal);
          if (recovered.state === "ENDED" || recovered.state === "FAILED") {
            setActiveCall(null);
          } else {
            setActiveCall(recovered);
            timer = window.setTimeout(() => void heartbeat(), 5000);
          }
        } catch (recoveryError) {
          if (!(recoveryError instanceof DOMException && recoveryError.name === "AbortError")) {
            showApiError(recoveryError);
          }
        }
      }
    };

    timer = window.setTimeout(() => void heartbeat(), 0);
    return () => {
      controller.abort();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [activeCall?.id, session?.csrfToken, showApiError]);

  useEffect(() => {
    if (!activeCall?.id || !session?.csrfToken) return;
    const callId = activeCall.id;
    const callPageKey = callPageKeyRef.current;

    const refreshCall = () => {
      if (document.visibilityState !== "visible") return;
      void getCall(callId, callPageKey)
        .then(setActiveCall)
        .catch(showApiError);
    };

    const closeForReason = (reason: "TAB_HIDDEN" | "PAGE_EXIT") => {
      if (terminatingCallRef.current) return;
      terminatingCallRef.current = true;
      liveConnectionRef.current?.close();
      liveConnectionRef.current = null;
      setActiveCall(null);
      void endCall(
        { csrfToken: session.csrfToken, callPageKey },
        callId,
        reason,
        true,
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        closeForReason("TAB_HIDDEN");
      } else {
        refreshCall();
      }
    };
    const closeOnPageExit = () => closeForReason("PAGE_EXIT");

    window.addEventListener("focus", refreshCall);
    window.addEventListener("pagehide", closeOnPageExit);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", refreshCall);
      window.removeEventListener("pagehide", closeOnPageExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeCall?.id, session?.csrfToken, showApiError]);

  useEffect(
    () => () => {
      liveConnectionRef.current?.close();
      liveConnectionRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (screen !== "deletionStatus" || !deletion?.id) return;
    const controller = new AbortController();
    let timer: number | null = null;
    const jobId = deletion.id;

    const poll = async () => {
      try {
        const result = await getDeletion(jobId, controller.signal);
        setDeletion(result);
        if (result.status === "PENDING" || result.status === "PROCESSING") {
          timer = window.setTimeout(() => void poll(), 2000);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) showApiError(error);
      }
    };

    void poll();
    return () => {
      controller.abort();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [deletion?.id, screen, showApiError]);

  const next = () =>
    go(screenOrder[(screenOrder.indexOf(screen) + 1) % screenOrder.length]);

  const handleVirtualLogin = async () => {
    if (!session?.csrfToken || busyAction) return;
    setBusyAction("login");
    try {
      await createVirtualSession(session.csrfToken);
      setSession(await getSession());
      go("profile");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const handleGuestLogin = async () => {
    if (!session?.csrfToken || busyAction) return;
    setBusyAction("login");
    try {
      await createGuestSession(session.csrfToken);
      setSession(await getSession());
      go("home");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const handleProfileRegistration = async () => {
    if (!session?.csrfToken || busyAction) return;
    setBusyAction("profile");
    try {
      const current = await getProfile();
      if (current.missingFields.length > 0 || !current.name || !current.phone) {
        setProfile(
          await saveProfile(session.csrfToken, {
            name: fixedUserProfile.name,
            gender: fixedUserProfile.gender,
            birthDate: fixedUserProfile.birthDate,
            phone: fixedUserProfile.phone,
            isConfirmed: true,
            expectedVersion: current.version,
          }),
        );
      } else {
        setProfile(current);
      }
      go("contacts");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddContact = async (contact: FixedEmergencyContact) => {
    if (!session?.csrfToken) throw new Error("세션이 필요합니다.");
    try {
      const saved = await addContactApi(session.csrfToken, {
        name: contact.name,
        relationship: contact.relation,
        phone: contact.phone,
      });
      setContacts((current) => [...current, toEmergencyContact(saved)]);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleDeleteContact = async (contact: EmergencyContact) => {
    if (!session?.csrfToken) throw new Error("세션이 필요합니다.");
    try {
      await deleteContactApi(session.csrfToken, contact.id, contact.version);
      setContacts((current) => current.filter((item) => item.id !== contact.id));
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleSavePermissions = async (
    values: Array<{ code: PermissionCode; status: PermissionStatus }>,
  ) => {
    if (!session?.csrfToken) throw new Error("세션이 필요합니다.");
    try {
      setPermissions(await savePermissions(session.csrfToken, values));
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const startCall = async (
    startMode: CallStartMode,
    selectedScenario: ScenarioCode,
    selectedCounterpart: CounterpartCode,
  ) => {
    if (!session?.csrfToken || busyAction) return;
    setBusyAction("call");
    callPageKeyRef.current = createCallPageKey();
    terminatingCallRef.current = false;
    reportedEventsRef.current.clear();
    liveConnectionRef.current?.close();
    liveConnectionRef.current = null;
    try {
      const created = await createCall(
        { csrfToken: session.csrfToken, callPageKey: callPageKeyRef.current },
        {
          clientCallId: crypto.randomUUID(),
          startMode,
          scenarioCode: selectedScenario,
          counterpartCode: selectedCounterpart,
          microphonePermission: "GRANTED",
        },
      );
      setScenarioCode(selectedScenario);
      setCounterpartCode(selectedCounterpart);
      setActiveCall(created);
      go("voiceLoading");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const sendEvent = useCallback(
    async (
      type: CallEventType,
      options: {
        grantId?: string | null;
        errorCode?: CallFailureCode | null;
        swallowError?: boolean;
      } = {},
    ) => {
      if (!activeCall || !session?.csrfToken) return;
      const eventKey = `${activeCall.id}:${type}`;
      if (reportedEventsRef.current.has(eventKey)) return;
      reportedEventsRef.current.add(eventKey);
      try {
        setActiveCall(
          await sendCallEvent(
            {
              csrfToken: session.csrfToken,
              callPageKey: callPageKeyRef.current,
            },
            activeCall.id,
            {
              type,
              grantId: options.grantId ?? null,
              errorCode: options.errorCode ?? null,
              expectedVersion: activeCall.version,
            },
          ),
        );
      } catch (error) {
        reportedEventsRef.current.delete(eventKey);
        showApiError(error);
        if (!options.swallowError) throw error;
      }
    },
    [activeCall, session?.csrfToken, showApiError],
  );

  const handleConnected = useCallback(
    async (readyConnection: ConnectionView) => {
      try {
        const { connectGeminiLive } = await import("./api/geminiLive");
        liveConnectionRef.current = await connectGeminiLive(readyConnection, {
          onError: (error) => showApiError(error),
        });
        await sendEvent("CONNECTED", { grantId: readyConnection.grantId });
        go("callRinging");
      } catch (error) {
        showApiError(error);
        await sendEvent("FAILED", {
          errorCode: "CONNECTION_FAILED",
          swallowError: true,
        });
        throw error;
      }
    },
    [go, sendEvent, showApiError],
  );

  const handleEndCall = async (reason: CallEndReason) => {
    if (!activeCall || !session?.csrfToken) return;
    terminatingCallRef.current = true;
    liveConnectionRef.current?.close();
    liveConnectionRef.current = null;
    try {
      setActiveCall(
        await endCall(
          { csrfToken: session.csrfToken, callPageKey: callPageKeyRef.current },
          activeCall.id,
          reason,
        ),
      );
    } catch (error) {
      showApiError(error);
    } finally {
      setActiveCall(null);
    }
  };

  const handleSettingChange = async (mode: IncomingAlertMode) => {
    if (!session?.csrfToken || !setting) return;
    try {
      setSetting(await saveSettings(session.csrfToken, mode, setting.version));
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleLogout = async () => {
    if (busyAction) return;
    setBusyAction("logout");
    try {
      await logout(session?.csrfToken);
      setSession(await getSession());
      setProfile(null);
      setContacts([]);
      setPermissions([]);
      setHomeData(null);
      setActiveCall(null);
      liveConnectionRef.current?.close();
      liveConnectionRef.current = null;
      go("login");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const handleWithdraw = async () => {
    if (!session?.csrfToken || busyAction) return;
    setBusyAction("withdraw");
    try {
      setDeletion(await requestAccountDeletion(session.csrfToken));
      go("deletionStatus");
    } catch (error) {
      showApiError(error);
    } finally {
      setBusyAction(null);
    }
  };

  const openEmergencyMessage = () => {
    if (!homeData) {
      setApiError("홈 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }
    if (homeData.isMessageComposeEligible) {
      go("emergencyMessage");
      return;
    }
    const reason = homeData.messageBlockReasons[0];
    if (reason === "LOGIN_REQUIRED") go("login");
    else if (reason === "PROFILE_REQUIRED") go("profile");
    else if (reason === "CONTACT_REQUIRED") go("contacts");
    else if (reason === "DATA_CLEANUP_PENDING") go("deletionStatus");
    else setApiError("진행 중인 통화를 종료한 뒤 다시 시도해주세요.");
  };

  const userName = profile?.name ?? fixedUserProfile.name;
  const displayName = activeCall?.displayName ?? "아빠";

  if (initializing) {
    return <div className="app-root" aria-label="세션 확인 중" />;
  }

  return (
    <div className="app-root">
      <div className="desktop-shell">
        <div className="phone-frame">
          <div key={screen} className={`screen-stage ${screenTransition}`}>
            {screen === "login" && (
              <Login
                onVirtualLogin={handleVirtualLogin}
                onGuestLogin={handleGuestLogin}
                busy={busyAction === "login"}
              />
            )}
            {screen === "profile" && (
              <Profile
                go={go}
                onRegister={handleProfileRegistration}
                busy={busyAction === "profile"}
              />
            )}
            {screen === "contacts" && (
              <Contacts go={go} contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} />
            )}
            {screen === "contactModal" && (
              <Contacts go={go} contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} modal />
            )}
            {screen === "terms" && <Terms go={go} />}
            {screen === "permissionBasic" && (
              <PermissionIntro go={go} sos={false} onSavePermissions={handleSavePermissions} />
            )}
            {screen === "permissionSos" && <PermissionIntro go={go} sos />}
            {screen === "complete" && <Complete go={go} />}
            {screen === "personaUse" && (
              <PersonaUse go={go} selected={scenarioCode} setSelected={setScenarioCode} callOptions={callOptions} />
            )}
            {screen === "personaPeople" && (
              <PersonaPeople go={go} selected={counterpartCode} setSelected={setCounterpartCode} callOptions={callOptions} />
            )}
            {screen === "callSetupCheck" && (
              <CallSetupCheck
                go={go}
                busy={busyAction === "call"}
                onStart={() => startCall("STANDARD", scenarioCode, counterpartCode)}
              />
            )}
            {screen === "voiceLoading" && (
              <VoiceLoading call={activeCall} callPageKey={callPageKeyRef.current} onConnected={handleConnected} />
            )}
            {screen === "home" && (
              <Home
                go={go}
                homeData={homeData}
                callOptions={callOptions}
                onRegularStart={() => go("personaUse")}
                onQuickStart={(selectedScenario) =>
                  void startCall("QUICK", selectedScenario, callOptions?.quickStart.counterpartCode ?? "FATHER")
                }
                onEmergencyMessage={openEmergencyMessage}
              />
            )}
            {screen === "emergencyMessage" && <EmergencyMessage go={go} />}
            {screen === "help" && <HelpScreen go={go} />}
            {screen === "callRinging" && (
              <CallRinging
                go={go}
                displayName={displayName}
                onShown={() => sendEvent("RINGING_SHOWN", { swallowError: true })}
                onAnswer={() => sendEvent("ANSWERED")}
                onDecline={() => handleEndCall("DECLINED")}
              />
            )}
            {screen === "call" && <Call go={go} displayName={displayName} onEnd={handleEndCall} />}
            {screen === "setting" && (
              <Setting go={go} userName={userName} onLogout={handleLogout} busy={busyAction === "logout"} />
            )}
            {screen === "settingDialog" && (
              <Setting go={go} dialog userName={userName} onLogout={handleLogout} busy={busyAction === "logout"} />
            )}
            {screen === "withdraw" && (
              <Withdraw go={go} onWithdraw={handleWithdraw} busy={busyAction === "withdraw"} />
            )}
            {screen === "deletionStatus" && <DeletionStatus go={go} deletion={deletion} />}
            {screen === "editProfile" && <Profile go={go} edit />}
            {screen === "editContacts" && (
              <Contacts go={go} contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} edit />
            )}
            {screen === "soundSetting" && (
              <SoundSetting
                go={go}
                mode={soundMode}
                setMode={setSoundMode}
                ringtone={ringtone}
                setRingtone={setRingtone}
                setting={setting}
                onChangeMode={handleSettingChange}
              />
            )}
            {screen === "permissionSetting" && (
              <PermissionSetting
                go={go}
                permissions={permissions}
                onSavePermissions={handleSavePermissions}
              />
            )}
          </div>
          <BottomDrawer screen={screen} />
          <button className="hidden-next" onClick={next} aria-label="다음 화면 테스트" />
          {apiError && (
            <div className="modal-layer">
              <ErrorMessage
                title="요청을 완료하지 못했습니다."
                description={apiError}
                onConfirm={() => setApiError(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
