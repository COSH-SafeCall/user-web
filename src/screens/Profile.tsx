import "./styles/Profile.css";
import { useState } from "react";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { SignupFormField } from "../components/SignupFormField";
import { useScale } from "../hooks/useScale";
import { mockKakaoUser, type KakaoGender } from "../mockKakaoUser";
import type { Go } from "../types";

type ProfileForm = {
  name: string;
  phone: string;
  birthDate: string;
  gender: KakaoGender;
};

type ProfileField = "name" | "phone" | "birthDate";

type ProfileErrors = Partial<Record<ProfileField, string>>;

const controlCharacterPattern = /[\u0000-\u001f\u007f]/;
const birthDatePattern = /^\d{4}\.\d{2}\.\d{2}$/;

function formatPhoneForInput(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.length !== 11) {
    return phone ?? "";
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getInputDigits(value: string, previousValue: string) {
  if (/[-.]$/.test(previousValue) && value === previousValue.slice(0, -1)) {
    return value.slice(0, -1).replace(/\D/g, "");
  }

  return value.replace(/\D/g, "");
}

function formatPhoneInput(value: string, previousValue: string) {
  const digits = getInputDigits(value, previousValue).slice(0, 11);

  if (digits.length < 3) {
    return digits;
  }

  if (digits.length === 3) {
    return `${digits}-`;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBirthDateInput(value: string, previousValue: string) {
  const digits = getInputDigits(value, previousValue).slice(0, 8);

  if (digits.length < 4) {
    return digits;
  }

  if (digits.length === 4) {
    return `${digits}.`;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

function formatProfileInput(
  field: ProfileField,
  value: string,
  previousValue: string,
) {
  if (field === "phone") {
    return formatPhoneInput(value, previousValue);
  }

  if (field === "birthDate") {
    return formatBirthDateInput(value, previousValue);
  }

  return value;
}

function createInitialProfile(): ProfileForm {
  return {
    name: mockKakaoUser.name ?? "",
    phone: formatPhoneForInput(mockKakaoUser.phone),
    birthDate: mockKakaoUser.birthDate?.replaceAll("-", ".") ?? "",
    gender: mockKakaoUser.gender,
  };
}

function validateName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "이름을 입력해주세요.";
  }

  if (controlCharacterPattern.test(name)) {
    return "이름에는 줄바꿈이나 사용할 수 없는 문자를 넣을 수 없습니다.";
  }

  if ([...trimmedName].length > 50) {
    return "이름은 1자 이상 50자 이하로 입력해주세요.";
  }

  return undefined;
}

function validatePhone(phone: string) {
  const trimmedPhone = phone.trim();
  const digits = trimmedPhone.replace(/\D/g, "");

  if (!trimmedPhone) {
    return "전화번호를 입력해주세요.";
  }

  if (!digits.startsWith("010") || digits.length !== 11) {
    return "010으로 시작하는 11자리 국내 휴대폰 번호를 입력해주세요.";
  }

  return undefined;
}

function isRealDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isFutureDate(year: number, month: number, day: number) {
  const date = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return date > today;
}

function validateBirthDate(birthDate: string) {
  const trimmedBirthDate = birthDate.trim();

  if (!trimmedBirthDate) {
    return "생년월일을 입력해주세요.";
  }

  if (!birthDatePattern.test(trimmedBirthDate)) {
    return "생년월일은 YYYY.MM.DD 형식으로 입력해주세요.";
  }

  const [year, month, day] = trimmedBirthDate.split(".").map(Number);

  if (!isRealDate(year, month, day)) {
    return "올바른 생년월일을 입력해주세요.";
  }

  if (isFutureDate(year, month, day)) {
    return "생년월일은 오늘 이후 날짜일 수 없습니다.";
  }

  return undefined;
}

function validateField(field: ProfileField, value: string) {
  if (field === "name") {
    return validateName(value);
  }

  if (field === "phone") {
    return validatePhone(value);
  }

  return validateBirthDate(value);
}

function validateProfile(profile: ProfileForm) {
  const errors: ProfileErrors = {};
  const fields: ProfileField[] = ["name", "phone", "birthDate"];

  fields.forEach((field) => {
    const error = validateField(field, profile[field]);

    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function Profile({ go, edit }: { go: Go; edit?: boolean }) {
  const [profile, setProfile] = useState<ProfileForm>(createInitialProfile);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const updateProfileField = (field: ProfileField) => (value: string) => {
    const formattedValue = formatProfileInput(field, value, profile[field]);

    setProfile((current) => ({
      ...current,
      [field]: formatProfileInput(field, value, current[field]),
    }));

    setErrors((current) => {
      const nextErrors = { ...current };
      const error = validateField(field, formattedValue);

      if (error) {
        nextErrors[field] = error;
      } else {
        delete nextErrors[field];
      }

      return nextErrors;
    });
  };

  const updateGender = (gender: KakaoGender) => {
    setProfile((current) => ({
      ...current,
      gender,
    }));
  };

  const handleNext = () => {
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    go(edit ? "setting" : "contacts");
  };

  return (
    <Canvas className="profile" style={useScale()}>
      {edit && <Header title="사용자 정보 수정" back={() => go("setting")} />}
      <div className={`profile-form ${edit ? "edit" : ""}`}>
        <SignupFormField
          label="이름"
          name="name"
          value={profile.name}
          onChange={updateProfileField("name")}
          description="긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데 사용됩니다."
          warning={errors.name}
        />
        <SignupFormField
          label="전화번호"
          name="phone"
          value={profile.phone}
          onChange={updateProfileField("phone")}
          inputMode="tel"
          maxLength={13}
          description={
            <>
              긴급 문자에서 보호자가 사용자를 식별할 수 있도록 안내되는 데
              사용됩니다.
              <br />
              전화번호는 가운데 네 자리를 가린 형태로 안내됩니다.
            </>
          }
          warning={errors.phone}
        />
        <SignupFormField
          label="생년월일"
          name="birthDate"
          value={profile.birthDate}
          onChange={updateProfileField("birthDate")}
          inputMode="numeric"
          maxLength={10}
          warning={errors.birthDate}
        />
        <p className="field-label">성별</p>
        <div className="segment">
          <button
            type="button"
            className={profile.gender === "MALE" ? "selected" : ""}
            onClick={() => updateGender("MALE")}
          >
            남자
          </button>
          <button
            type="button"
            className={profile.gender === "FEMALE" ? "selected" : ""}
            onClick={() => updateGender("FEMALE")}
          >
            여자
          </button>
        </div>
      </div>
      <BottomButton label={edit ? "저장하기" : "다음"} onClick={handleNext} />
    </Canvas>
  );
}
