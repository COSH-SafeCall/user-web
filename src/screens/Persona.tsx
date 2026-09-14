import "./styles/Persona.css";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  MdDirectionsCarFilled,
  MdDirectionsRun,
  MdOutlineGroups,
  MdRecordVoiceOver,
} from "react-icons/md";
import father from "../assets/figma/raw-image-1.jpeg";
import mother from "../assets/figma/raw-image-3.jpeg";
import friend from "../assets/figma/raw-image-5.jpeg";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import { PersonaPersonOption } from "../components/PersonaPersonOption";
import { PersonaSituationOption } from "../components/PersonaSituationOption";
import type { Go } from "../types";

type SituationChoice = {
  icon: IconType;
  iconClass: string;
  text: string;
};

type PersonChoice = {
  image: string;
  imageClass: string;
  label: string;
};

const situationChoices: SituationChoice[] = [
  {
    icon: MdDirectionsRun,
    iconClass: "run",
    text: "누군가 따라오는\n것 같아요",
  },
  {
    icon: MdDirectionsCarFilled,
    iconClass: "car",
    text: "택시 안이\n불안해요",
  },
  {
    icon: MdRecordVoiceOver,
    iconClass: "voice",
    text: "낯선 사람이\n근처에 있어요",
  },
  {
    icon: MdOutlineGroups,
    iconClass: "groups",
    text: "혼자 귀가하기\n무서워요",
  },
];

const people: PersonChoice[] = [
  { image: father, imageClass: "father", label: "아빠" },
  { image: mother, imageClass: "mother", label: "엄마" },
  { image: friend, imageClass: "friend", label: "친구" },
];

function Pager({ active }: { active: number }) {
  return (
    <div className="pager">
      {[0, 1, 2].map((n) => (
        <span key={n} className={active === n ? "active" : ""} />
      ))}
    </div>
  );
}

export function PersonaUse({
  go,
  selected,
  setSelected,
}: {
  go: Go;
  selected: number;
  setSelected: (value: number) => void;
}) {
  return (
    <GenericPersona
      title="어떤 상황에서 안심 통화를 사용하시나요?"
      active={0}
      back={() => go("home")}
      next={() => go("personaPeople")}
    >
      {situationChoices.map(({ icon, iconClass, text }, index) => (
        <PersonaSituationOption
          key={text}
          icon={icon}
          iconClass={iconClass}
          label={text}
          selected={selected === index}
          onClick={() => setSelected(index)}
        />
      ))}
    </GenericPersona>
  );
}

export function PersonaPeople({
  go,
  selected,
  setSelected,
}: {
  go: Go;
  selected: number;
  setSelected: (value: number) => void;
}) {
  return (
    <GenericPersona
      title="통화하고 싶은 가상의 인물을 선택해주세요."
      active={1}
      back={() => go("personaUse")}
      next={() => go("callSetupCheck")}
    >
      {people.map(({ image, imageClass, label }, index) => (
        <PersonaPersonOption
          key={label}
          image={image}
          imageClass={imageClass}
          label={label}
          selected={selected === index}
          onClick={() => setSelected(index)}
        />
      ))}
    </GenericPersona>
  );
}

function GenericPersona({
  children,
  title,
  active,
  back,
  next,
}: {
  children: ReactNode;
  title: string;
  active: number;
  back: () => void;
  next: () => void;
}) {
  return (
    <Canvas className="persona">
      <div className="persona-top">
        <button onClick={back}>
          <Icon name="keyboard_arrow_left" size={52} />
        </button>
        <Pager active={active} />
        <button onClick={next}>
          <Icon name="keyboard_arrow_right" size={52} />
        </button>
      </div>
      <h1>{title}</h1>
      <div className="persona-options">{children}</div>
      <BottomButton label="다음" onClick={next} />
    </Canvas>
  );
}

