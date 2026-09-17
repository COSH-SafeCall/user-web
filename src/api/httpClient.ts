const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api.dev-safecall.r-e.kr"
).replace(/\/$/, "");

type ValidationError = {
  field: string;
  value: unknown;
  reason: string;
};

type ApiErrorBody = {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  errors?: ValidationError[];
  path?: string;
};

export class ApiError extends Error {
  status: number;
  code: string;
  errors: ValidationError[];
  path?: string;
  retryAfterSeconds?: number;

  constructor(response: Response, body: ApiErrorBody) {
    super(body.message ?? "요청을 처리하지 못했습니다.");
    this.name = "ApiError";
    this.status = response.status;
    this.code = body.code ?? "UNKNOWN_ERROR";
    this.errors = body.errors ?? [];
    this.path = body.path;

    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds)) {
        this.retryAfterSeconds = seconds;
      }
    }
  }
}

export type RequestSecurity = {
  csrfToken?: string;
  idempotencyKey?: string;
  callPageKey?: string;
};

type ApiRequestOptions = RequestInit & RequestSecurity;

export type ApiResponse<T> = {
  data: T;
  response: Response;
};

export function createIdempotencyKey() {
  return crypto.randomUUID();
}

export function createCallPageKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    csrfToken,
    idempotencyKey,
    callPageKey,
    headers: providedHeaders,
    body,
    ...requestOptions
  } = options;
  const headers = new Headers(providedHeaders);

  headers.set("Accept", "application/json");

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }
  if (callPageKey) {
    headers.set("X-Call-Page-Key", callPageKey);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...requestOptions,
    headers,
    body,
  });

  if (!response.ok && response.status !== 304) {
    let errorBody: ApiErrorBody = {};

    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      // JSON 오류 본문이 없으면 HTTP 상태와 공통 메시지를 사용합니다.
    }

    throw new ApiError(response, errorBody);
  }

  let data: T;
  if (response.status === 204 || response.status === 304) {
    data = undefined as T;
  } else {
    data = (await response.json()) as T;
  }

  return { data, response };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const result = await apiRequestWithMeta<T>(path, options);
  return result.data;
}

export function toUserMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return "요청이 취소되었습니다.";
  }
  return "네트워크 연결을 확인한 뒤 다시 시도해주세요.";
}
