import type { SessionView } from "./contracts";
import { apiRequest } from "./httpClient";

export function getSession(signal?: AbortSignal) {
  return apiRequest<SessionView>("/api/v1/auth/session", { signal });
}

export function createVirtualSession(csrfToken: string) {
  return apiRequest<SessionView>("/api/v1/auth/virtual", {
    method: "POST",
    csrfToken,
    body: JSON.stringify({}),
  });
}

export function createGuestSession(csrfToken: string) {
  return apiRequest<SessionView>("/api/v1/auth/guest", {
    method: "POST",
    csrfToken,
    body: JSON.stringify({}),
  });
}

export function logout(csrfToken?: string) {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    csrfToken,
    body: JSON.stringify({}),
  });
}
