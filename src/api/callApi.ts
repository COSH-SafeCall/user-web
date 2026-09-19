import type {
  CallEndReason,
  CallEventType,
  CallFailureCode,
  CallStartMode,
  CallView,
  ConnectionView,
  CounterpartCode,
  HeartbeatView,
  IssuingView,
  ScenarioCode,
} from "./contracts";
import {
  apiRequest,
  createIdempotencyKey,
  type RequestSecurity,
} from "./httpClient";

type CallSecurity = Required<
  Pick<RequestSecurity, "csrfToken" | "callPageKey">
>;

export function createCall(
  security: CallSecurity,
  request: {
    clientCallId: string;
    startMode: CallStartMode;
    scenarioCode: ScenarioCode;
    counterpartCode: CounterpartCode;
    microphonePermission: "GRANTED";
  },
) {
  return apiRequest<CallView>("/api/v1/calls", {
    method: "POST",
    ...security,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify(request),
  });
}

export function getCall(
  callId: string,
  callPageKey: string,
  signal?: AbortSignal,
) {
  return apiRequest<CallView>(`/api/v1/calls/${callId}`, {
    callPageKey,
    signal,
  });
}

export function getConnection(
  callId: string,
  callPageKey: string,
  signal?: AbortSignal,
  grantId?: string,
) {
  const query = grantId ? `?grantId=${encodeURIComponent(grantId)}` : "";
  return apiRequest<IssuingView | ConnectionView>(
    `/api/v1/calls/${callId}/connection${query}`,
    { callPageKey, signal },
  );
}

export function sendCallEvent(
  security: CallSecurity,
  callId: string,
  request: {
    type: CallEventType;
    grantId: string | null;
    expectedVersion: number;
    errorCode?: CallFailureCode | null;
  },
) {
  return apiRequest<CallView>(`/api/v1/calls/${callId}/events`, {
    method: "POST",
    ...security,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify({
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      errorCode: null,
      ...request,
    }),
  });
}

export function sendHeartbeat(
  security: CallSecurity,
  callId: string,
  signal?: AbortSignal,
) {
  return apiRequest<HeartbeatView>(`/api/v1/calls/${callId}/heartbeat`, {
    method: "POST",
    ...security,
    signal,
    body: JSON.stringify({}),
  });
}

export function endCall(
  security: CallSecurity,
  callId: string,
  reason: CallEndReason,
  keepalive = false,
) {
  return apiRequest<CallView>(`/api/v1/calls/${callId}/end`, {
    method: "POST",
    ...security,
    idempotencyKey: createIdempotencyKey(),
    keepalive,
    body: JSON.stringify({ reason, occurredAt: new Date().toISOString() }),
  });
}
