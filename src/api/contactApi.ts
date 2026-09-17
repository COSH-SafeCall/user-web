import type { ContactView } from "./contracts";
import { apiRequest, createIdempotencyKey } from "./httpClient";

type Items<T> = { items: T[] };

export async function getContacts(signal?: AbortSignal) {
  const result = await apiRequest<Items<ContactView>>(
    "/api/v1/me/emergency-contacts",
    { signal },
  );
  return result.items;
}

export function addContact(
  csrfToken: string,
  contact: { name: string; relationship: string; phone: string },
) {
  return apiRequest<ContactView>("/api/v1/me/emergency-contacts", {
    method: "POST",
    csrfToken,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify(contact),
  });
}

export function deleteContact(
  csrfToken: string,
  contactId: string,
  expectedVersion: number,
) {
  return apiRequest<void>(`/api/v1/me/emergency-contacts/${contactId}`, {
    method: "DELETE",
    csrfToken,
    idempotencyKey: createIdempotencyKey(),
    body: JSON.stringify({ expectedVersion }),
  });
}
