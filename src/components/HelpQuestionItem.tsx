import "./styles/HelpQuestionItem.css";
import { Icon } from "./Icon";

type HelpQuestionItemProps = {
  question: string;
  answer?: string;
  open?: boolean;
  onClick?: () => void;
};

export function HelpQuestionItem({
  question,
  answer,
  open = false,
  onClick,
}: HelpQuestionItemProps) {
  return (
    <button
      className={`help-question-item${open ? " open" : ""}`}
      onClick={onClick}
      aria-expanded={answer ? open : undefined}
    >
      <span>
        <b>Q.</b> {question}
      </span>
      <Icon name="chevron_right" />
      {open && answer && <p>{answer}</p>}
    </button>
  );
}
