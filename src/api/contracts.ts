export type SessionKind = "ANONYMOUS" | "GUEST" | "MEMBER";
export type SettingsMode = "LOGIN_ONLY" | "MEMBER";

export type SessionView = {
  kind: SessionKind;
  isAuthenticated: boolean;
  csrfToken: string;
  expiresAt: string;
  settingsMode: SettingsMode;
};

export type UserGender = "MALE" | "FEMALE" | null;

export type ProfileView = {
  name: string | null;
  gender: UserGender;
  birthDate: string | null;
  phone: string | null;
  genderSource?: string | null;
  birthDateSource?: string | null;
  missingFields: string[];
  profileConfirmedAt?: string | null;
  version: number;
};

export type PermissionCode = "MICROPHONE" | "LOCATION";
export type PermissionStatus = "GRANTED" | "DENIED" | "NOT_DETERMINED";

export type PermissionView = {
  code: PermissionCode;
  status: PermissionStatus;
  updatedAt: string;
};

export type ContactView = {
  id: string;
  slot: 1 | 2;
  name: string;
  relationship: string;
  phone: string;
  version: number;
};

export type IncomingAlertMode = "RINGTONE" | "SILENT";

export type SettingView = {
  incomingAlertMode: IncomingAlertMode;
  version: number;
};

export type MessageBlockReason =
  | "LOGIN_REQUIRED"
  | "PROFILE_REQUIRED"
  | "CALL_ALREADY_OPEN"
  | "DATA_CLEANUP_PENDING"
  | "CONTACT_REQUIRED";

export type HomeView = {
  isMessageComposeEligible: boolean;
  messageBlockReasons: MessageBlockReason[];
  isLocationPermissionGranted: boolean;
  guardianCount: number;
  settingsMode: SettingsMode;
};

export type ScenarioCode =
  | "FOLLOWED"
  | "UNSAFE_TAXI"
  | "STRANGER_NEARBY"
  | "WALKING_ALONE";

export type CounterpartCode = "FATHER" | "MOTHER" | "FRIEND";

export type ScenarioOption = {
  code: ScenarioCode;
  label: string;
  quickDirection: string | null;
};

export type CounterpartOption = {
  code: CounterpartCode;
  label: string;
  displayName: string;
};

export type CallOptionsView = {
  scenarios: ScenarioOption[];
  counterparts: CounterpartOption[];
  quickStart: {
    holdMs: number;
    counterpartCode: CounterpartCode;
  };
  catalogVersion: number;
};

export type CallState =
  | "CREATED"
  | "PREPARING"
  | "RINGING"
  | "ACTIVE"
  | "ENDED"
  | "FAILED";

export type CallStartMode = "STANDARD" | "QUICK";

export type CallEndReason =
  | "USER_ENDED"
  | "DECLINED"
  | "BACK_NAVIGATION"
  | "TAB_HIDDEN"
  | "PAGE_EXIT"
  | "PAGE_RELOAD"
  | "SWITCH_TO_FALLBACK"
  | "DURATION_LIMIT";

export type CallView = {
  id: string;
  clientCallId: string;
  state: CallState;
  startMode: CallStartMode;
  scenarioCode: ScenarioCode;
  counterpartCode: CounterpartCode;
  displayName: string;
  createdAt: string;
  ringingAt: string | null;
  answeredAt: string | null;
  endedAt: string | null;
  endReason: string | null;
  leaseExpiresAt: string;
  expiresAt: string;
  policyVersion: string;
  version: number;
};

export type IssuingView = {
  status: "ISSUING";
  retryAfterMs: number;
};

export type ConnectionView = {
  grantId: string;
  status: "READY";
  token: string;
  model: string;
  apiVersion: string;
  voiceId: string;
  responseModalities: string[];
  newSessionExpiresAt: string;
  expiresAt: string;
  uses: number;
};

export type HeartbeatView = {
  state: CallState;
  leaseExpiresAt: string;
  expiresAt: string;
};

export type CallEventType =
  | "CONNECTED"
  | "RINGING_SHOWN"
  | "ANSWERED"
  | "FAILED";

export type CallFailureCode =
  | "CONNECTION_FAILED"
  | "RINGING_FAILED"
  | "MICROPHONE_FAILED"
  | "AUDIO_FAILED"
  | "CONNECTION_LOST";

export type DeletionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type DeletionView = {
  id: string;
  scope: "ACCOUNT" | "USAGE_HISTORY";
  status: DeletionStatus;
  requestedAt: string;
  dueAt: string;
  completedAt: string | null;
  errorCode: string | null;
};
