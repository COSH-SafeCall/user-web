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
    <button className="help-question-item" onClick={onClick}>
      <span>
        <b>Q.</b> {question}
      </span>
      <Icon name="chevron_right" />
      {open && answer && <p>{answer}</p>}
    </button>
  );
}
