import "./styles/SignupFormField.css";
import type { ReactNode } from "react";

type SignupFormFieldProps = {
  label: string;
  value: string;
  name: string;
  onChange: (value: string) => void;
  description?: ReactNode;
  warning?: ReactNode;
  inputMode?: "text" | "tel" | "numeric";
  maxLength?: number;
};

export function SignupFormField({
  label,
  value,
  name,
  onChange,
  description,
  warning,
  inputMode = "text",
  maxLength,
}: SignupFormFieldProps) {
  return (
    <div className="signup-form-field">
      <p className="signup-form-field-label">{label}</p>
      <input
        name={name}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      />
      <div className="signup-form-field-line" />
      {warning ? <em>{warning}</em> : description && <small>{description}</small>}
    </div>
  );
}
