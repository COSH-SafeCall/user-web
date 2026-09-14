import "./styles/Terms.css";
import { useState } from "react";
import { MdCheck } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { RequirementErrorMessage } from "../components/RequirementErrorMessage";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function Terms({ go }: { go: Go }) {
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);

  const next = () => {
    if (!agreed) {
      setShowError(true);
      return;
    }

    go("permissionBasic");
  };

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
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        <span>
          <MdCheck aria-hidden="true" />
        </span>
        위 사항에 동의하십니까?
      </label>
      <BottomButton label="다음" onClick={next} />
      {showError && (
        <div className="modal-layer">
          <RequirementErrorMessage
            type="requiredConsentDenied"
            onConfirm={() => setShowError(false)}
          />
        </div>
      )}
    </Canvas>
  );
}
