import "./App.css";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  getConnection,
  sendCallEvent,
  sendHeartbeat,
} from "./api/callApi";
import { getDeletion, requestAccountDeletion } from "./api/deletionApi";
import { ApiError, createCallPageKey, toUserMessage } from "./api/httpClient";
import type { GeminiLiveConnection } from "./api/geminiLive";
import { fixedUserProfile, type FixedEmergencyContact } from "./fixedUserData";
import type {
  CallEndReason,
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

type ScreenFlow = "onboarding" | "home" | "setting" | "help";
type ScreenTransition = "same-flow" | "flow-change";
type PendingCall = {
  clientCallId: string;
  callPageKey: string;
  startMode: CallStartMode;
  scenarioCode: ScenarioCode;
  counterpartCode: CounterpartCode;
};
type SafeCallHistoryState = {
  safeCall?: {
    screen: Screen;
    previousScreen: Screen | null;
  };
};

const DEMO_CLOSING_LEAD_MS = 15_000;
const REFERENCE_VIEWPORT_WIDTH = 402;
const REFERENCE_VIEWPORT_HEIGHT = 874;

function applyViewportLayoutVariables() {
  const viewport = window.visualViewport;
  const viewportWidth = Math.max(
    viewport?.width ?? window.innerWidth,
    1,
  );
  const viewportHeight = Math.max(
    viewport?.height ?? window.innerHeight,
    1,
  );
  const mobileFrameWidth = Math.min(
    viewportWidth,
    REFERENCE_VIEWPORT_WIDTH,
  );
  const fixedLayoutScale = Math.min(
    1,
    mobileFrameWidth / REFERENCE_VIEWPORT_WIDTH,
    viewportHeight / REFERENCE_VIEWPORT_HEIGHT,
  );

  document.documentElement.style.setProperty(
    "--app-height",
    `${viewportHeight}px`,
  );
  document.documentElement.style.setProperty(
    "--fixed-layout-scale",
    String(fixedLayoutScale),
  );
  document.documentElement.style.setProperty(
    "--fixed-layout-width",
    `${mobileFrameWidth / fixedLayoutScale}px`,
  );
  document.documentElement.style.setProperty(
    "--fixed-layout-height",
    `${viewportHeight / fixedLayoutScale}px`,
  );
}

const validScreens = new Set<Screen>([...screenOrder, "terms"]);

function getSafeCallHistoryState(state: unknown) {
  if (!state || typeof state !== "object") return null;
  const safeCall = (state as SafeCallHistoryState).safeCall;
  if (!safeCall || !validScreens.has(safeCall.screen)) return null;
  return safeCall;
}

function createAbortError() {
  return new DOMException("통화 연결이 취소되었습니다.", "AbortError");
}

function isDeletionPendingError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === "ACCOUNT_DELETION_PENDING" ||
      error.code === "DATA_CLEANUP_PENDING")
  );
}

function waitForRetry(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(createAbortError());
    };
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

async function waitForReadyConnection(
  callId: string,
  callPageKey: string,
  signal: AbortSignal,
) {
  while (true) {
    if (signal.aborted) throw createAbortError();
    const result = await getConnection(callId, callPageKey, signal);
    if (result.status === "READY") return result;
    await waitForRetry(Math.max(result.retryAfterMs, 100), signal);
  }
}

function mergeHistoryState(safeCall: SafeCallHistoryState["safeCall"]) {
  const currentState = window.history.state;
  const baseState =
    currentState && typeof currentState === "object" ? currentState : {};
  return { ...baseState, safeCall };
}

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
  const [callConnectedAt, setCallConnectedAt] = useState<number | null>(null);
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
  const [callRateLimitError, setCallRateLimitError] = useState<string | null>(
    null,
  );
  const [startInAlternativeMode, setStartInAlternativeMode] = useState(false);
  const [isDurationLimitNoticeOpen, setIsDurationLimitNoticeOpen] =
    useState(false);
  const callOptionsCacheRef = useRef<{
    etag: string;
    data: CallOptionsView;
  } | null>(null);
  const callPageKeyRef = useRef("");
  const pendingCallRef = useRef<PendingCall | null>(null);
  const liveConnectionRef = useRef<GeminiLiveConnection | null>(null);
  const callConnectionAbortRef = useRef<AbortController | null>(null);
  const terminatingCallRef = useRef(false);
  const screenRef = useRef<Screen>("login");
  const isDeletionProcessing =
    deletion?.scope === "ACCOUNT" &&
    (deletion.status === "PENDING" || deletion.status === "PROCESSING");

  useLayoutEffect(() => {
    let animationFrameId = 0;
    const viewport = window.visualViewport;
    const scheduleViewportUpdate = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(
        applyViewportLayoutVariables,
      );
    };

    applyViewportLayoutVariables();
    window.addEventListener("resize", scheduleViewportUpdate);
    window.addEventListener("orientationchange", scheduleViewportUpdate);
    viewport?.addEventListener("resize", scheduleViewportUpdate);
    viewport?.addEventListener("scroll", scheduleViewportUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleViewportUpdate);
      window.removeEventListener("orientationchange", scheduleViewportUpdate);
      viewport?.removeEventListener("resize", scheduleViewportUpdate);
      viewport?.removeEventListener("scroll", scheduleViewportUpdate);
    };
  }, []);

  const applyScreen = useCallback((nextScreen: Screen) => {
    const currentScreen = screenRef.current;
    screenRef.current = nextScreen;
    setScreenTransition(
      getScreenFlow(currentScreen) === getScreenFlow(nextScreen)
        ? "same-flow"
        : "flow-change",
    );
    setScreen(nextScreen);
  }, []);

  const go: Go = useCallback(
    (nextScreen) => {
      if (isDeletionProcessing && nextScreen !== "deletionStatus") {
        window.history.replaceState(
          mergeHistoryState({
            screen: "deletionStatus",
            previousScreen: null,
          }),
          "",
        );
        applyScreen("deletionStatus");
        return;
      }

      if (nextScreen === screenRef.current) return;

      const currentHistory = getSafeCallHistoryState(window.history.state);
      if (currentHistory?.previousScreen === nextScreen) {
        window.history.back();
        return;
      }

      window.history.pushState(
        mergeHistoryState({
          screen: nextScreen,
          previousScreen: screenRef.current,
        }),
        "",
      );
      applyScreen(nextScreen);
    },
    [applyScreen, isDeletionProcessing],
  );

  const replaceScreen = useCallback(
    (nextScreen: Screen, resetPrevious = false) => {
      if (isDeletionProcessing && nextScreen !== "deletionStatus") {
        window.history.replaceState(
          mergeHistoryState({
            screen: "deletionStatus",
            previousScreen: null,
          }),
          "",
        );
        applyScreen("deletionStatus");
        return;
      }

      const currentHistory = getSafeCallHistoryState(window.history.state);
      window.history.replaceState(
        mergeHistoryState({
          screen: nextScreen,
          previousScreen: resetPrevious
            ? null
            : (currentHistory?.previousScreen ?? null),
        }),
        "",
      );
      applyScreen(nextScreen);
    },
    [applyScreen, isDeletionProcessing],
  );

  const showApiError = useCallback((error: unknown) => {
    setApiError(toUserMessage(error));
  }, []);

  useEffect(() => {
    window.history.replaceState(
      mergeHistoryState({ screen: screenRef.current, previousScreen: null }),
      "",
    );
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const historyScreen = getSafeCallHistoryState(event.state)?.screen;
      if (!historyScreen) return;

      if (isDeletionProcessing && historyScreen !== "deletionStatus") {
        window.history.replaceState(
          mergeHistoryState({
            screen: "deletionStatus",
            previousScreen: null,
          }),
          "",
        );
        applyScreen("deletionStatus");
        return;
      }

      if (activeCall?.id && session?.csrfToken) {
        const callId = activeCall.id;
        const callPageKey = callPageKeyRef.current;
        terminatingCallRef.current = true;
        callConnectionAbortRef.current?.abort();
        callConnectionAbortRef.current = null;
        liveConnectionRef.current?.close();
        liveConnectionRef.current = null;
        setCallConnectedAt(null);
        setActiveCall(null);
        void endCall(
          { csrfToken: session.csrfToken, callPageKey },
          callId,
          "BACK_NAVIGATION",
          true,
        ).catch(showApiError);
      }

      applyScreen(historyScreen);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    activeCall?.id,
    applyScreen,
    isDeletionProcessing,
    session?.csrfToken,
    showApiError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    getSession(controller.signal)
      .then((result) => {
        if (ignore) return;
        setSession(result);
        if (result.kind === "MEMBER") replaceScreen("home", true);
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
  }, [replaceScreen, showApiError]);

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
      session.settingsMode === "MEMBER"
        ? getSettings(controller.signal)
        : Promise.resolve(null),
    ])
      .then(([nextHome, nextOptions, nextSetting]) => {
        setHomeData(nextHome);
        setCallOptions(nextOptions.data);
        callOptionsCacheRef.current = nextOptions;
        if (nextSetting) setSetting(nextSetting);
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
      callConnectionAbortRef.current?.abort();
      callConnectionAbortRef.current = null;
      liveConnectionRef.current?.close();
      liveConnectionRef.current = null;
      setCallConnectedAt(null);
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
      callConnectionAbortRef.current?.abort();
      callConnectionAbortRef.current = null;
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
      replaceScreen("profile", true);
    } catch (error) {
      if (isDeletionPendingError(error) && deletion?.id) {
        replaceScreen("deletionStatus", true);
      } else {
        showApiError(error);
      }
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
      replaceScreen("home", true);
    } catch (error) {
      if (isDeletionPendingError(error) && deletion?.id) {
        replaceScreen("deletionStatus", true);
      } else {
        showApiError(error);
      }
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

  const showIncomingCall = async (
    startMode: CallStartMode,
    selectedScenario: ScenarioCode,
    selectedCounterpart: CounterpartCode,
  ) => {
    if (!session?.csrfToken || busyAction) return;
    terminatingCallRef.current = false;
    liveConnectionRef.current?.close();
    liveConnectionRef.current = null;
    callConnectionAbortRef.current?.abort();
    callConnectionAbortRef.current = null;
    setActiveCall(null);
    setCallConnectedAt(null);
    setCallRateLimitError(null);
    setStartInAlternativeMode(false);
    setScenarioCode(selectedScenario);
    setCounterpartCode(selectedCounterpart);
    pendingCallRef.current = {
      clientCallId: crypto.randomUUID(),
      callPageKey: createCallPageKey(),
      startMode,
      scenarioCode: selectedScenario,
      counterpartCode: selectedCounterpart,
    };
    replaceScreen("callRinging");
  };

  const handleAnswerIncomingCall = async () => {
    const pending = pendingCallRef.current;
    if (!pending || !session?.csrfToken || busyAction) return;
    setBusyAction("call");
    callPageKeyRef.current = pending.callPageKey;
    const connectionController = new AbortController();
    callConnectionAbortRef.current?.abort();
    callConnectionAbortRef.current = connectionController;
    try {
      const created = await createCall(
        { csrfToken: session.csrfToken, callPageKey: pending.callPageKey },
        {
          clientCallId: pending.clientCallId,
          startMode: pending.startMode,
          scenarioCode: pending.scenarioCode,
          counterpartCode: pending.counterpartCode,
          microphonePermission: "GRANTED",
        },
      );
      setActiveCall(created);
      replaceScreen("call");
      const readyConnection = await waitForReadyConnection(
        created.id,
        pending.callPageKey,
        connectionController.signal,
      );
      await connectCall(created, readyConnection, connectionController.signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (
        error instanceof ApiError &&
        error.status === 429 &&
        error.code === "RATE_LIMITED"
      ) {
        setCallRateLimitError(error.message);
        return;
      }
      showApiError(error);
      throw error;
    } finally {
      if (callConnectionAbortRef.current === connectionController) {
        callConnectionAbortRef.current = null;
      }
      setBusyAction(null);
    }
  };

  const handleDeclineIncomingCall = async () => {
    pendingCallRef.current = null;
    setActiveCall(null);
  };

  const handleRateLimitFallback = () => {
    pendingCallRef.current = null;
    setCallRateLimitError(null);
    setActiveCall(null);
    setCallConnectedAt(null);
    setStartInAlternativeMode(true);
    replaceScreen("call");
  };

  const handleRateLimitHome = () => {
    pendingCallRef.current = null;
    setCallRateLimitError(null);
    setStartInAlternativeMode(false);
    replaceScreen("home", true);
  };

  const connectCall = useCallback(
    async (
      call: CallView,
      readyConnection: ConnectionView,
      signal?: AbortSignal,
    ) => {
      if (!session?.csrfToken) throw new Error("통화 세션이 필요합니다.");
      let currentCall = call;
      const security = {
        csrfToken: session.csrfToken,
        callPageKey: callPageKeyRef.current,
      };
      try {
        const { connectGeminiLive } = await import("./api/geminiLive");
        const liveConnection = await connectGeminiLive(readyConnection, {
          onOpen: () => {
            if (!signal?.aborted) setCallConnectedAt(Date.now());
          },
          onError: (error) => {
            setCallConnectedAt(null);
            showApiError(error);
          },
          onClose: () => setCallConnectedAt(null),
        });
        if (signal?.aborted) {
          liveConnection.close();
          throw createAbortError();
        }
        liveConnectionRef.current = liveConnection;
        currentCall = await sendCallEvent(security, currentCall.id, {
          type: "CONNECTED",
          grantId: readyConnection.grantId,
          errorCode: null,
          expectedVersion: currentCall.version,
        });
        currentCall = await sendCallEvent(security, currentCall.id, {
          type: "RINGING_SHOWN",
          grantId: null,
          errorCode: null,
          expectedVersion: currentCall.version,
        });
        currentCall = await sendCallEvent(security, currentCall.id, {
          type: "ANSWERED",
          grantId: null,
          errorCode: null,
          expectedVersion: currentCall.version,
        });
        pendingCallRef.current = null;
        setActiveCall(currentCall);
        if (screenRef.current !== "call") replaceScreen("call");
      } catch (error) {
        setCallConnectedAt(null);
        liveConnectionRef.current?.close();
        liveConnectionRef.current = null;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        try {
          setActiveCall(
            await sendCallEvent(security, currentCall.id, {
              type: "FAILED",
              grantId: null,
              errorCode: "CONNECTION_FAILED",
              expectedVersion: currentCall.version,
            }),
          );
        } catch {
          setActiveCall(currentCall);
        }
        throw error;
      }
    },
    [replaceScreen, session?.csrfToken, showApiError],
  );

  const handleConnected = useCallback(
    async (readyConnection: ConnectionView) => {
      if (!activeCall) throw new Error("통화 세션이 필요합니다.");
      await connectCall(activeCall, readyConnection);
    },
    [activeCall, connectCall],
  );

  const handleEndCall = async (reason: CallEndReason) => {
    if (!activeCall || !session?.csrfToken) return;
    terminatingCallRef.current = true;
    pendingCallRef.current = null;
    callConnectionAbortRef.current?.abort();
    callConnectionAbortRef.current = null;
    liveConnectionRef.current?.close();
    liveConnectionRef.current = null;
    setCallConnectedAt(null);
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

  useEffect(() => {
    if (
      screen !== "call" ||
      !activeCall ||
      !session?.csrfToken ||
      !liveConnectionRef.current ||
      activeCall.state !== "ACTIVE"
    ) {
      return;
    }

    const callId = activeCall.id;
    const callPageKey = callPageKeyRef.current;
    const delayMs = Math.max(
      0,
      Date.parse(activeCall.expiresAt) - Date.now() - DEMO_CLOSING_LEAD_MS,
    );
    const timer = window.setTimeout(() => {
      if (terminatingCallRef.current) return;
      const connection = liveConnectionRef.current;
      if (!connection) return;
      terminatingCallRef.current = true;

      void connection.finishDemo().then(async () => {
        liveConnectionRef.current = null;
        try {
          await endCall(
            { csrfToken: session.csrfToken, callPageKey },
            callId,
            "DURATION_LIMIT",
          );
        } catch {
          // 최준혁: 서버 상한이 먼저 만료돼도 사용자에게는 정상 체험 종료로 안내한다.
        } finally {
          setActiveCall(null);
          replaceScreen("home", true);
          setIsDurationLimitNoticeOpen(true);
        }
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [activeCall, replaceScreen, screen, session?.csrfToken]);

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
      setCallConnectedAt(null);
      callConnectionAbortRef.current?.abort();
      callConnectionAbortRef.current = null;
      liveConnectionRef.current?.close();
      liveConnectionRef.current = null;
      replaceScreen("login", true);
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

  const handleDeletionCompleted = async () => {
    if (deletion?.status !== "COMPLETED" || busyAction) return;
    setBusyAction("deletion-session");

    try {
      const nextSession = await getSession();
      setSession(nextSession);
      setProfile(null);
      setContacts([]);
      setPermissions([]);
      setHomeData(null);
      setActiveCall(null);
      setCallConnectedAt(null);
      setDeletion(null);
      replaceScreen("login", true);
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
  const displayName =
    activeCall?.displayName ??
    callOptions?.counterparts.find((option) => option.code === counterpartCode)
      ?.displayName ??
    ({ FATHER: "아빠", MOTHER: "엄마", FRIEND: "친구" } as const)[
      counterpartCode
    ];

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
            {screen === "complete" && (
              <Complete go={(nextScreen) => replaceScreen(nextScreen, true)} />
            )}
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
                onStart={() => showIncomingCall("STANDARD", scenarioCode, counterpartCode)}
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
                  void showIncomingCall("QUICK", selectedScenario, callOptions?.quickStart.counterpartCode ?? "FATHER")
                }
                onEmergencyMessage={openEmergencyMessage}
              />
            )}
            {screen === "emergencyMessage" && <EmergencyMessage go={go} />}
            {screen === "help" && <HelpScreen go={go} />}
            {screen === "callRinging" && (
              <CallRinging
                go={(nextScreen) => replaceScreen(nextScreen)}
                displayName={displayName}
                counterpartCode={counterpartCode}
                playRingtone={setting?.incomingAlertMode !== "SILENT"}
                onAnswer={handleAnswerIncomingCall}
                onDecline={handleDeclineIncomingCall}
              />
            )}
            {screen === "call" && (
              <Call
                go={(nextScreen) => {
                  if (nextScreen === "home") setStartInAlternativeMode(false);
                  replaceScreen(nextScreen);
                }}
                displayName={displayName}
                counterpartCode={activeCall?.counterpartCode ?? counterpartCode}
                connectedAt={callConnectedAt}
                startInAlternativeMode={startInAlternativeMode}
                onEnd={handleEndCall}
              />
            )}
            {screen === "setting" && (
              <Setting go={go} userName={userName} onLogout={handleLogout} busy={busyAction === "logout"} />
            )}
            {screen === "settingDialog" && (
              <Setting go={go} dialog userName={userName} onLogout={handleLogout} busy={busyAction === "logout"} />
            )}
            {screen === "withdraw" && (
              <Withdraw go={go} onWithdraw={handleWithdraw} busy={busyAction === "withdraw"} />
            )}
            {screen === "deletionStatus" && (
              <DeletionStatus
                go={go}
                deletion={deletion}
                onCompleted={handleDeletionCompleted}
                busy={busyAction === "deletion-session"}
              />
            )}
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
          {callRateLimitError && (
            <div className="modal-layer">
              <ErrorMessage
                title="체험 통화 횟수를 모두 사용했습니다."
                description={callRateLimitError}
                confirmLabel="대체통화로 전환"
                onConfirm={handleRateLimitFallback}
                secondaryLabel="홈으로"
                onSecondary={handleRateLimitHome}
              />
            </div>
          )}
          {isDurationLimitNoticeOpen && (
            <div className="modal-layer">
              <ErrorMessage
                title="체험 통화가 종료되었습니다."
                description="약 1분의 체험 통화가 종료되었습니다. 홈 화면에서 새 통화를 시작할 수 있습니다."
                onConfirm={() => setIsDurationLimitNoticeOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
