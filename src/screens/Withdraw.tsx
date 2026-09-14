import "./styles/Withdraw.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";

export function Withdraw({ go }: { go: Go }) {
  return (
    <Canvas className="withdraw">
      <Header title="탈퇴하기" back={() => go("setting")} />
      <p>
        탈퇴하는 즉시 서버에 저장된 개인정보가 삭제됩니다. 추후 로그인
        서비스 이용을 원하실 경우 다시 가입을 진행하여야 합니다.
        탈퇴하시겠습니까?
      </p>
      <div className="two-buttons">
        <BottomButton dark label="취소" onClick={() => go("setting")} />
        <BottomButton label="탈퇴하기" onClick={() => go("login")} />
      </div>
    </Canvas>
  );
}

