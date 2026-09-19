import "./styles/Persona.css";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  MdDirectionsCarFilled,
  MdDirectionsRun,
  MdOutlineGroups,
  MdRecordVoiceOver,
} from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Icon } from "../components/Icon";
import { PersonaPersonOption } from "../components/PersonaPersonOption";
import { PersonaSituationOption } from "../components/PersonaSituationOption";
import { counterpartProfiles } from "../counterpartProfiles";
import type {
  CallOptionsView,
  CounterpartCode,
  ScenarioCode,
} from "../api/contracts";
import type { Go } from "../types";

type SituationChoice = {
  code: ScenarioCode;
  icon: IconType;
  iconClass: string;
  text: string;
};

type PersonChoice = {
  code: CounterpartCode;
  image: string;
  imageClass: string;
  label: string;
};

const situationVisuals: SituationChoice[] = [
  {
    code: "FOLLOWED",
    icon: MdDirectionsRun,
    iconClass: "run",
    text: "누군가 따라오는\n것 같아요",
  },
  {
    code: "UNSAFE_TAXI",
    icon: MdDirectionsCarFilled,
    iconClass: "car",
    text: "택시 안이\n불안해요",
  },
  {
    code: "STRANGER_NEARBY",
    icon: MdRecordVoiceOver,
    iconClass: "voice",
    text: "낯선 사람이\n근처에 있어요",
  },
  {
    code: "WALKING_ALONE",
    icon: MdOutlineGroups,
    iconClass: "groups",
    text: "혼자 귀가하기\n무서워요",
  },
];

const peopleVisuals: PersonChoice[] = [
  { code: "FATHER", ...counterpartProfiles.FATHER, label: "아빠" },
  { code: "MOTHER", ...counterpartProfiles.MOTHER, label: "엄마" },
  { code: "FRIEND", ...counterpartProfiles.FRIEND, label: "친구" },
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
  callOptions,
}: {
  go: Go;
  selected: ScenarioCode;
  setSelected: (value: ScenarioCode) => void;
  callOptions: CallOptionsView | null;
}) {
  const situationChoices = situationVisuals.map((visual) => ({
    ...visual,
    text:
      callOptions?.scenarios.find((option) => option.code === visual.code)
        ?.label ?? visual.text,
  }));

  return (
    <GenericPersona
      title="어떤 상황에서 안심 통화를 사용하시나요?"
      active={0}
      back={() => go("home")}
      next={() => go("personaPeople")}
    >
      {situationChoices.map(({ code, icon, iconClass, text }) => (
        <PersonaSituationOption
          key={code}
          icon={icon}
          iconClass={iconClass}
          label={text}
          selected={selected === code}
          onClick={() => setSelected(code)}
        />
      ))}
    </GenericPersona>
  );
}

export function PersonaPeople({
  go,
  selected,
  setSelected,
  callOptions,
}: {
  go: Go;
  selected: CounterpartCode;
  setSelected: (value: CounterpartCode) => void;
  callOptions: CallOptionsView | null;
}) {
  const people = peopleVisuals.map((visual) => ({
    ...visual,
    label:
      callOptions?.counterparts.find((option) => option.code === visual.code)
        ?.label ?? visual.label,
  }));

  return (
    <GenericPersona
      title="통화하고 싶은 가상의 인물을 선택해주세요."
      active={1}
      back={() => go("personaUse")}
      next={() => go("callSetupCheck")}
    >
      {people.map(({ code, image, imageClass, label }) => (
        <PersonaPersonOption
          key={code}
          image={image}
          imageClass={imageClass}
          label={label}
          selected={selected === code}
          onClick={() => setSelected(code)}
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

