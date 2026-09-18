import {
  GoogleGenAI,
  Modality,
  type LiveServerMessage,
  type Session,
} from "@google/genai";
import type { ConnectionView } from "./contracts";

type GeminiLiveCallbacks = {
  onError: (error: unknown) => void;
  onClose?: () => void;
};

export type GeminiLiveConnection = {
  close: () => void;
  finishDemo: () => Promise<void>;
};

const DEMO_CLOSING_SIGNAL = "[SAFECALL_DEMO_CLOSING]";
const DEMO_CLOSING_TIMEOUT_MS = 12_000;

function float32ToPcm16Base64(samples: Float32Array) {
  const pcm = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function decodePcm16(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = view.getInt16(index * 2, true) / 0x8000;
  }
  return samples;
}

export async function connectGeminiLive(
  connection: ConnectionView,
  callbacks: GeminiLiveCallbacks,
): Promise<GeminiLiveConnection> {
  const inputStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inputContext = new AudioContext({ sampleRate: 16000 });
  const outputContext = new AudioContext({ sampleRate: 24000 });
  const inputSource = inputContext.createMediaStreamSource(inputStream);
  const processor = inputContext.createScriptProcessor(2048, 1, 1);
  const silentGain = inputContext.createGain();
  silentGain.gain.value = 0;
  let session: Session | null = null;
  let closed = false;
  let inputStopped = false;
  let finishing = false;
  let finishPromise: Promise<void> | null = null;
  let resolveFinish: (() => void) | null = null;
  let finishTimeout: number | null = null;
  let playbackFinishTimeout: number | null = null;
  let nextOutputAt = outputContext.currentTime;
  const outputSources = new Set<AudioBufferSourceNode>();

  const stopInput = () => {
    if (inputStopped) return;
    inputStopped = true;
    processor.disconnect();
    inputSource.disconnect();
    silentGain.disconnect();
    inputStream.getTracks().forEach((track) => track.stop());
  };

  const closeResources = () => {
    if (closed) return;
    closed = true;
    stopInput();
    if (finishTimeout !== null) window.clearTimeout(finishTimeout);
    if (playbackFinishTimeout !== null) window.clearTimeout(playbackFinishTimeout);
    outputSources.forEach((source) => source.stop());
    outputSources.clear();
    session?.close();
    void inputContext.close();
    void outputContext.close();
    resolveFinish?.();
    resolveFinish = null;
  };

  const finishAfterPlayback = () => {
    if (!finishing || closed || playbackFinishTimeout !== null) return;
    const remainingMs = Math.max(0, nextOutputAt - outputContext.currentTime) * 1000;
    playbackFinishTimeout = window.setTimeout(closeResources, remainingMs + 120);
  };

  const playAudio = (message: LiveServerMessage) => {
    const parts = message.serverContent?.modelTurn?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      if (!data || !part.inlineData?.mimeType?.startsWith("audio/")) continue;

      const samples = decodePcm16(data);
      const buffer = outputContext.createBuffer(1, samples.length, 24000);
      buffer.copyToChannel(samples, 0);
      const source = outputContext.createBufferSource();
      source.buffer = buffer;
      source.connect(outputContext.destination);
      nextOutputAt = Math.max(nextOutputAt, outputContext.currentTime);
      source.start(nextOutputAt);
      nextOutputAt += buffer.duration;
      outputSources.add(source);
      source.onended = () => outputSources.delete(source);
    }

    if (message.serverContent?.interrupted) {
      outputSources.forEach((source) => source.stop());
      outputSources.clear();
      nextOutputAt = outputContext.currentTime;
    }

    if (message.serverContent?.turnComplete) finishAfterPlayback();
  };

  try {
    const ai = new GoogleGenAI({
      apiKey: connection.token,
      httpOptions: { apiVersion: connection.apiVersion },
    });

    session = await ai.live.connect({
      model: connection.model,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: connection.voiceId },
          },
        },
      },
      callbacks: {
        onmessage: playAudio,
        onerror: (event) => callbacks.onError(event.error ?? event),
        onclose: () => {
          closeResources();
          callbacks.onClose?.();
        },
      },
    });

    processor.onaudioprocess = (event) => {
      if (!session || closed || finishing) return;
      const channel = event.inputBuffer.getChannelData(0);
      session.sendRealtimeInput({
        audio: {
          data: float32ToPcm16Base64(channel),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    };
    inputSource.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(inputContext.destination);

    const finishDemo = () => {
      if (finishPromise) return finishPromise;
      if (closed || !session) return Promise.resolve();

      finishing = true;
      stopInput();
      finishPromise = new Promise<void>((resolve) => {
        resolveFinish = resolve;
        finishTimeout = window.setTimeout(closeResources, DEMO_CLOSING_TIMEOUT_MS);
        try {
          session?.sendClientContent({
            turns: [{ role: "user", parts: [{ text: DEMO_CLOSING_SIGNAL }] }],
            turnComplete: true,
          });
        } catch {
          closeResources();
        }
      });
      return finishPromise;
    };

    return { close: closeResources, finishDemo };
  } catch (error) {
    closeResources();
    throw error;
  }
}
