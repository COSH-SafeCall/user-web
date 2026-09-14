import "./styles/Profile.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { SignupFormField } from "../components/SignupFormField";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export function Profile({ go, edit }: { go: Go; edit?: boolean }) {
  return (
    <Canvas className="profile" style={useScale()}>
      {edit && (
        <Header title="사용자 정보 수정" back={() => go("setting")} />
      )}
      <div className={`profile-form ${edit ? "edit" : ""}`}>
        <SignupFormField
          label="이름"
          value="김이름"
          description="긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데 사용됩니다."
        />
        <SignupFormField
          label="전화번호"
          value="010-0000-0000"
          description={
            <>
              긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데
              사용됩니다.
              <br />
              전화번호는 가운데 네 자리를 가린 형태로 안내됩니다.
            </>
          }
        />
        <SignupFormField label="생년월일" value="2026.09.06" />
        <p className="field-label">성별</p>
        <div className="segment">
          <span>남자</span>
          <span className="selected">여자</span>
        </div>
      </div>
      <BottomButton
        label={edit ? "저장하기" : "다음"}
        onClick={() => go(edit ? "setting" : "contacts")}
      />
    </Canvas>
  );
}
