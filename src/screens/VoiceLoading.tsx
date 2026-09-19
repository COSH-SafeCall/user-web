import "./styles/VoiceLoading.css";
import { useEffect, useState } from "react";
import type { CallView, ConnectionView } from "../api/contracts";
import { getConnection } from "../api/callApi";
import { toUserMessage } from "../api/httpClient";
import { Canvas } from "../components/Canvas";

export function VoiceLoading({
  call,
  callPageKey,
  onConnected,
}: {
  call: CallView | null;
  callPageKey: string;
  onConnected: (connection: ConnectionView) => Promise<void>;
}) {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!call) return;

    const controller = new AbortController();
    let retryTimer: number | null = null;
    let disposed = false;

    const poll = async () => {
      try {
        const result = await getConnection(
          call.id,
          callPageKey,
          controller.signal,
        );

        if (disposed) return;
        if (result.status === "ISSUING") {
          retryTimer = window.setTimeout(
            () => void poll(),
            Math.max(result.retryAfterMs, 100),
          );
          return;
        }

        await onConnected(result);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setConnectionError(toUserMessage(error));
      }
    };

    void poll();

    return () => {
      disposed = true;
      controller.abort();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
    };
  }, [call, callPageKey, onConnected]);

  return (
    <Canvas className="voice-loading">
      <div className="voice-loading-content">
        <h1>가상 통화를 준비하고 있습니다...</h1>
        <div className="voice-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        {connectionError && (
          <p className="voice-loading-error" role="alert">
            {connectionError}
          </p>
        )}
        <p className="voice-loading-policy">
          AI는 실제로 실행되지 않은 112 신고,<br />
          긴급 문자 발송 또는 위치 링크 전송이<br />
          완료되었다고 말하지 않습니다.
          <br />
          <br />
          AI는 사용자를 대신해 위험 여부를<br />
          판단하거나 긴급 문자 발송 또는<br />
          112 신고를 실행하지 않습니다.
          <br />
          <br />
          AI는 사용자에게 위험 인물과 대치,<br />
          추적 또는 촬영을 유도하지 않습니다.
        </p>
      </div>
    </Canvas>
  );
}
