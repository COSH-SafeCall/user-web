import "./styles/ErrorMessage.css";
import type { ReactNode } from "react";

type ErrorMessageProps = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function ErrorMessage({
  title,
  description,
  confirmLabel = "확인",
  onConfirm,
}: ErrorMessageProps) {
  return (
    <div className="error-message" aria-live="assertive">
      <b>{title}</b>
      <p>{description}</p>
      <button type="button" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}
