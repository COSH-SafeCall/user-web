export type PermissionRequestResult = {
  granted: boolean;
  reason?: "unsupported" | "denied" | "unavailable";
};

export type LocationPermissionRequestResult = PermissionRequestResult & {
  coords?: {
    latitude: number;
    longitude: number;
  };
};

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

export function requestLocationPermission(): Promise<LocationPermissionRequestResult> {
  if (!navigator.geolocation) {
    return Promise.resolve({
      granted: false,
      reason: "unsupported",
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        resolve({
          granted: false,
          reason:
            error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 10000,
      },
    );
  });
}
