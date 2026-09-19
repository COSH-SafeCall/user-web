import type { CallOptionsView, HomeView } from "./contracts";
import { apiRequest, apiRequestWithMeta } from "./httpClient";

export function getHome(signal?: AbortSignal) {
  return apiRequest<HomeView>("/api/v1/home", { signal });
}

export async function getCallOptions(
  previous?: { etag: string; data: CallOptionsView },
  signal?: AbortSignal,
) {
  const headers = new Headers();
  if (previous?.etag) {
    headers.set("If-None-Match", previous.etag);
  }

  const result = await apiRequestWithMeta<CallOptionsView>(
    "/api/v1/call-options",
    { headers, signal, cache: "no-cache" },
  );

  if (result.response.status === 304 && previous) {
    return previous;
  }

  return {
    etag: result.response.headers.get("ETag") ?? "",
    data: result.data,
  };
}
