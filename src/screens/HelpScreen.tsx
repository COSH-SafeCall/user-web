import "./styles/HelpScreen.css";
import { useState } from "react";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { HelpQuestionItem } from "../components/HelpQuestionItem";
import type { Go } from "../types";

const helpRows = [
  {
    question: "SOS 기능을 다시 켜고 싶어요.",
    answer: "웹에서는 기기의 SOS 기능을 켜거나 설정 화면을 열 수 없습니다. 실제 긴급 상황이라면 직접 112 또는 119에 연락해주세요.",
  },
  {
    question: "긴급 연락처를 수정하고 싶어요.",
    answer: "설정의 비상 연락처 수정에서 등록된 연락처를 삭제하고 다시 등록할 수 있습니다.",
  },
  {
    question: "긴급 연락처를 입력하지 않아도 괜찮을까요?",
    answer: "연락처가 없어도 AI 안심 통화는 이용할 수 있습니다. 긴급 메시지 작성에는 등록된 비상 연락처가 필요합니다.",
  },
  {
    question: "가상 전화를 소리 말고 진동이나 무음으로 받고 싶어요.",
    answer: "설정의 가상 통화 수신 벨소리 설정에서 무음을 선택할 수 있습니다. 브라우저 진동은 지원하지 않습니다.",
  },
  {
    question: "음량 조절이 필수적인가요?",
    answer: "필수는 아니지만 통화 소리가 들리면서 주변 상황도 파악할 수 있도록 기기 음량을 적절히 조절해주세요.",
  },
];

export function HelpScreen({ go }: { go: Go }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <Canvas className="help-screen" layout="scroll">
      <Header title="도움말" back={() => go("setting")} />
      <section className="help-list">
        {helpRows.map((row, index) => (
          <HelpQuestionItem
            key={row.question}
            question={row.question}
            answer={row.answer}
            open={openIndex === index}
            onClick={() => toggleAnswer(index)}
          />
        ))}
      </section>
    </Canvas>
  );
}
