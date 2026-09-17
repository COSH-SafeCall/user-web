import type { ProfileView, UserGender } from "./contracts";
import { apiRequest, createIdempotencyKey } from "./httpClient";

export function getProfile(signal?: AbortSignal) {
  return apiRequest<ProfileView>("/api/v1/me/profile", { signal });
}

export function saveProfile(
  csrfToken: string,
  request: {
    name: string;
    gender: UserGender;
    birthDate: string | null;
    phone: string;
    isConfirmed: true;
    expectedVersion: number;
  },
) {
  return apiRequest<ProfileView>("/api/v1/me/profile", {
    method: "PATCH",
    csrfToken,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify(request),
  });
}
