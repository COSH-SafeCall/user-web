import type { DeletionView } from "./contracts";
import { apiRequest, createIdempotencyKey } from "./httpClient";

export function requestAccountDeletion(csrfToken: string) {
  return apiRequest<DeletionView>("/api/v1/me/data-deletions", {
    method: "POST",
    csrfToken,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify({ scope: "ACCOUNT", isConfirmed: true }),
  });
}

export function getDeletion(jobId: string, signal?: AbortSignal) {
  return apiRequest<DeletionView>(`/api/v1/data-deletions/${jobId}`, {
    signal,
  });
}
