const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

export type MessageRecipient = {
  id?: string;
  slot?: number;
  name?: string;
  relationship?: string;
  phone?: string;
  version?: number;
};

export type MessageIdentity = {
  name?: string;
  maskedPhone?: string;
};

export type MessageMapTemplate = {
  version?: number;
  urlTemplate?: string;
  coordinateSystem?: string;
  maxAgeSeconds?: number;
  maxAccuracyMeters?: number;
};

export type MessageComposerView = {
  mode?: "SAFETY" | "TEST";
  recipients?: MessageRecipient[];
  identity?: MessageIdentity;
  baseBody?: string;
  templateVersion?: number;
  isLocationPermissionGranted?: boolean;
  mapTemplate?: MessageMapTemplate;
  notice?: string;
  preparedAt?: string;
  expiresAt?: string;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export class MessageComposerError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "MessageComposerError";
    this.status = status;
    this.code = code;
  }
}

export async function getSafetyMessageComposer(signal?: AbortSignal) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/message-composer?mode=SAFETY`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  );

  if (!response.ok) {
    let body: ApiErrorBody = {};

    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // JSON 오류 본문이 없으면 HTTP 상태를 기준으로 공통 오류를 표시합니다.
    }

    throw new MessageComposerError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? "안심 메시지 작성 자료를 불러오지 못했습니다.",
    );
  }

  return (await response.json()) as MessageComposerView;
}
