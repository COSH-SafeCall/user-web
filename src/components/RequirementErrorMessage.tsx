import { ErrorMessage } from "./ErrorMessage";
import {
  requirementErrorMessages,
  type RequirementErrorMessageKey,
} from "../errorMessages";

type RequirementErrorMessageProps = {
  type: RequirementErrorMessageKey;
  onConfirm: () => void;
};

export function RequirementErrorMessage({
  type,
  onConfirm,
}: RequirementErrorMessageProps) {
  const message = requirementErrorMessages[type];

  return (
    <ErrorMessage
      title={message.title}
      description={message.description}
      confirmLabel={message.confirmLabel}
      onConfirm={onConfirm}
    />
  );
}
