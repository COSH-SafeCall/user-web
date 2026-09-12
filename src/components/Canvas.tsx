import type { CSSProperties, ReactNode } from "react";

type CanvasProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

export function Canvas({
  children,
  className = "",
  style,
  onClick,
}: CanvasProps) {
  return (
    <main className={`canvas ${className}`} style={style} onClick={onClick}>
      {children}
    </main>
  );
}
