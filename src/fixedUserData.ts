import type { UserGender } from "./api/contracts";

export type { UserGender };

export type FixedUserProfile = {
  userId: string;
  name: string;
  gender: UserGender;
  birthDate: string;
  phone: string;
};

export type FixedEmergencyContact = {
  name: string;
  relation: string;
  phone: string;
};

export const fixedUserProfile: FixedUserProfile = {
  userId: "8b0f0c4f-5f3a-4a7b-9c8a-5d2f1e7a2c10",
  name: "홍길동",
  gender: "MALE",
  birthDate: "2026-09-06",
  phone: "01000000000",
};

export const fixedEmergencyContacts: FixedEmergencyContact[] = [
  {
    name: "보호자 1",
    relation: "아버지",
    phone: "010-1111-2222",
  },
  {
    name: "보호자 2",
    relation: "어머니",
    phone: "010-3333-4444",
  },
];
