import "./styles/Canvas.css";
import type { CSSProperties, ReactNode } from "react";

type CanvasProps = {
  children: ReactNode;
  className?: string;
  layout?: "fixed" | "scroll" | "onboarding";
  style?: CSSProperties;
  onClick?: () => void;
};

export function Canvas({
  children,
  className = "",
  layout = "fixed",
  style,
  onClick,
}: CanvasProps) {
  return (
    <main
      className={`canvas canvas-layout-${layout} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </main>
  );
}

