import "./styles/Terms.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function Terms({ go }: { go: Go }) {
  return (
    <Canvas className="terms" style={useScale()}>
      <h1>개인정보 처리 및 AI 통화 동의</h1>
      <div className="terms-body">
        <p>
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다.
        </p>
        <p>
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
        </p>
        <p>
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
          개인정보 처리 동의 내용입니다. 개인정보 처리 동의 내용입니다.
        </p>
        <p>개인정보 처리 동의 내용입니다.</p>
      </div>
      <label className="agree">
        <span />위 사항에 동의하십니까?
      </label>
      <BottomButton label="다음" onClick={() => go("permissionBasic")} />
    </Canvas>
  );
}

