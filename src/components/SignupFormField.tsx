import "./styles/SignupFormField.css";
import type { ReactNode } from "react";

type SignupFormFieldProps = {
  label: string;
  value: string;
  description?: ReactNode;
  warning?: ReactNode;
};

export function SignupFormField({
  label,
  value,
  description,
  warning,
}: SignupFormFieldProps) {
  return (
    <div className="signup-form-field">
      <p className="signup-form-field-label">{label}</p>
      <strong>{value}</strong>
      <div className="signup-form-field-line" />
      {description && <small>{description}</small>}
      {warning && <em>{warning}</em>}
    </div>
  );
}
