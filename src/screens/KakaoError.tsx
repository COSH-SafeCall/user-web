import "./styles/KakaoError.css";
import { Canvas } from "../components/Canvas";
import { ErrorMessage } from "../components/ErrorMessage";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function KakaoError({ go }: { go: Go }) {
  return (
    <Canvas className="error-screen" style={useScale()}>
      <ErrorMessage
        title="카카오 로그인에 실패하였습니다."
        description="네트워크 연결을 확인하시고 다시 시도해주세요."
        onConfirm={() => go("profile")}
      />
    </Canvas>
  );
}

