import type { PermissionStatus } from "../api/contracts";

export type PermissionRequestResult = {
  granted: boolean;
  reason?: "unsupported" | "denied" | "unavailable" | "timeout";
};

export type LocationPermissionRequestResult = PermissionRequestResult & {
  coords?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp?: number;
};

export type BrowserPermissionState = PermissionState | "unsupported" | "unknown";

function getPermissionFailureReason(
  error: unknown,
): PermissionRequestResult["reason"] {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "denied";
  }

  return "unavailable";
}

export async function requestMicrophonePermission(): Promise<PermissionRequestResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      granted: false,
      reason: "unsupported",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((track) => track.stop());

    return {
      granted: true,
    };
  } catch (error) {
    return {
      granted: false,
      reason: getPermissionFailureReason(error),
    };
  }
}

export function toPermissionStatus(
  result: PermissionRequestResult,
): PermissionStatus {
  if (result.granted) return "GRANTED";
  if (result.reason === "denied") return "DENIED";
  return "NOT_DETERMINED";
}

export async function getLocationPermissionState(): Promise<BrowserPermissionState> {
  if (!navigator.geolocation) {
    return "unsupported";
  }

  if (!navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unknown";
  }
}

export async function requestLocationPermission(
  options: PositionOptions = {},
): Promise<LocationPermissionRequestResult> {
  if (!navigator.geolocation) {
    return {
      granted: false,
      reason: "unsupported",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          timestamp: position.timestamp,
        });
      },
      async (error) => {
        const permissionState = await getLocationPermissionState();
        const permissionDenied = error.code === error.PERMISSION_DENIED;

        resolve({
          granted: !permissionDenied && permissionState === "granted",
          reason:
            permissionDenied
              ? "denied"
              : error.code === error.TIMEOUT
                ? "timeout"
                : "unavailable",
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 30000,
        ...options,
      },
    );
  });
}
