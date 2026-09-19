import type { IncomingAlertMode, SettingView } from "./contracts";
import { apiRequest, createIdempotencyKey } from "./httpClient";

export function getSettings(signal?: AbortSignal) {
  return apiRequest<SettingView>("/api/v1/me/settings", { signal });
}

export function saveSettings(
  csrfToken: string,
  incomingAlertMode: IncomingAlertMode,
  expectedVersion: number,
) {
  return apiRequest<SettingView>("/api/v1/me/settings", {
    method: "PATCH",
    csrfToken,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify({ incomingAlertMode, expectedVersion }),
  });
}
