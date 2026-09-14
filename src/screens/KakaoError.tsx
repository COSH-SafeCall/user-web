import "./styles/KakaoError.css";
import { Canvas } from "../components/Canvas";
import { RequirementErrorMessage } from "../components/RequirementErrorMessage";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function KakaoError({ go }: { go: Go }) {
  return (
    <Canvas className="error-screen" style={useScale()}>
      <RequirementErrorMessage
        type="kakaoLoginFailed"
        onConfirm={() => go("profile")}
      />
    </Canvas>
  );
}
