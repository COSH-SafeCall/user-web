import "./styles/Profile.css";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { SignupFormField } from "../components/SignupFormField";
import { fixedUserProfile } from "../fixedUserData";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

function formatPhoneForDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 11) {
    return phone;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const fixedProfile = {
  name: fixedUserProfile.name,
  phone: formatPhoneForDisplay(fixedUserProfile.phone),
  birthDate: fixedUserProfile.birthDate.replaceAll("-", "."),
  gender: fixedUserProfile.gender,
};

export function Profile({
  go,
  edit,
  onRegister,
  busy,
}: {
  go: Go;
  edit?: boolean;
  onRegister?: () => Promise<void>;
  busy?: boolean;
}) {
  const handleNext = async () => {
    if (edit) {
      go("setting");
      return;
    }

    await onRegister?.();
  };

  return (
    <Canvas className="profile" style={useScale()}>
      {edit && <Header title="사용자 정보" back={() => go("setting")} />}
      <div className={`profile-form ${edit ? "edit" : ""}`}>
        <SignupFormField
          label="이름"
          name="name"
          value={fixedProfile.name}
          readOnly
          description="가상 회원에게 미리 제공된 정보이며 변경할 수 없습니다."
        />
        <SignupFormField
          label="전화번호"
          name="phone"
          value={fixedProfile.phone}
          inputMode="tel"
          readOnly
          description={
            <>
              가상 회원에게 미리 제공된 정보이며 변경할 수 없습니다.
              <br />
              긴급 문자에서는 가운데 네 자리를 가린 형태로 안내됩니다.
            </>
          }
        />
        <SignupFormField
          label="생년월일"
          name="birthDate"
          value={fixedProfile.birthDate}
          inputMode="numeric"
          readOnly
        />
        <p className="field-label">성별</p>
        <div className="segment">
          <button
            type="button"
            className={fixedProfile.gender === "MALE" ? "selected" : ""}
            disabled
          >
            남자
          </button>
          <button
            type="button"
            className={fixedProfile.gender === "FEMALE" ? "selected" : ""}
            disabled
          >
            여자
          </button>
        </div>
      </div>
      <BottomButton
        label={busy ? "저장 중..." : edit ? "확인" : "다음"}
        onClick={() => void handleNext()}
        disabled={busy}
        immediate
      />
    </Canvas>
  );
}
