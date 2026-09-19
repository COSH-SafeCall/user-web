import "./styles/ErrorMessage.css";
import type { ReactNode } from "react";

type ErrorMessageProps = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function ErrorMessage({
  title,
  description,
  confirmLabel = "확인",
  onConfirm,
  secondaryLabel,
  onSecondary,
}: ErrorMessageProps) {
  return (
    <div className="error-message" aria-live="assertive">
      <b>{title}</b>
      <p>{description}</p>
      <div className="error-message-actions">
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="error-message-secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
