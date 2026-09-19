import type {
  PermissionCode,
  PermissionStatus,
  PermissionView,
} from "./contracts";
import { apiRequest, createIdempotencyKey } from "./httpClient";

type Items<T> = { items: T[] };

export async function getPermissions(signal?: AbortSignal) {
  const result = await apiRequest<Items<PermissionView>>(
    "/api/v1/me/permissions",
    { signal },
  );
  return result.items;
}

export async function savePermissions(
  csrfToken: string,
  permissions: Array<{ code: PermissionCode; status: PermissionStatus }>,
) {
  const result = await apiRequest<Items<PermissionView>>(
    "/api/v1/me/permissions",
    {
      method: "POST",
      csrfToken,
      idempotencyKey: createIdempotencyKey(),
      body: JSON.stringify({ permissions }),
    },
  );
  return result.items;
}
