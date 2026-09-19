import "./styles/HelpQuestionItem.css";
import { Icon } from "./Icon";

type HelpQuestionItemProps = {
  question: string;
  answer: string;
  open?: boolean;
  onClick: () => void;
};

export function HelpQuestionItem({
  question,
  answer,
  open = false,
  onClick,
}: HelpQuestionItemProps) {
  return (
    <button
      type="button"
      className={`help-question-item${open ? " open" : ""}`}
      onClick={onClick}
      aria-expanded={open}
    >
      <span>
        <b>Q.</b> {question}
      </span>
      <Icon name="chevron_right" />
      {open && <span className="help-answer">{answer}</span>}
    </button>
  );
}
