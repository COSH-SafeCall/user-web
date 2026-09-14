export type KakaoGender = "MALE" | "FEMALE" | "UNKNOWN";

export type KakaoUserProfile = {
  userId: string | null;
  name: string | null;
  gender: KakaoGender;
  birthDate: string | null;
  phone: string | null;
  genderSource: "KAKAO" | "USER_CONFIRMED" | "UNKNOWN";
  birthDateSource: "KAKAO" | "USER_CONFIRMED" | "UNKNOWN";
  confirmedAt: string | null;
  version: number;
};

export const mockKakaoUser: KakaoUserProfile = {
  userId: "8b0f0c4f-5f3a-4a7b-9c8a-5d2f1e7a2c10",
  name: "김이름",
  gender: "FEMALE",
  birthDate: "2026-09-06",
  phone: "01000000000",
  genderSource: "KAKAO",
  birthDateSource: "KAKAO",
  confirmedAt: "2026-09-14T09:00:00+09:00",
  version: 1,
};
