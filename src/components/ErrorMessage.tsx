import "./styles/ErrorMessage.css";
type ErrorMessageProps = {
  title: string;
  description: string;
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

