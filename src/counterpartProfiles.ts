import father from "./assets/figma/raw-image-1.jpeg";
import mother from "./assets/figma/raw-image-3.jpeg";
import friend from "./assets/figma/raw-image-5.jpeg";
import type { CounterpartCode } from "./api/contracts";

export type CounterpartProfile = {
  image: string;
  imageClass: string;
  fallbackName: string;
};

export const counterpartProfiles: Record<CounterpartCode, CounterpartProfile> = {
  FATHER: {
    image: father,
    imageClass: "father",
    fallbackName: "아빠",
  },
  MOTHER: {
    image: mother,
    imageClass: "mother",
    fallbackName: "엄마",
  },
  FRIEND: {
    image: friend,
    imageClass: "friend",
    fallbackName: "친구",
  },
};
