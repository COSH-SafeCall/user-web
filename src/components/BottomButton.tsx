import "./styles/BottomButton.css";
import { useEffect, useRef, useState } from "react";

type BottomButtonProps = {
  label: string;
  onClick: () => void;
  dark?: boolean;
  light?: boolean;
};

export function BottomButton({
  label,
  onClick,
  dark,
  light,
}: BottomButtonProps) {
  const [pressed, setPressed] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const stopPressFeedback = () => {
    if (feedbackTimerRef.current === null) {
      setPressed(false);
    }
  };

  const handleClick = () => {
    if (feedbackTimerRef.current !== null) {
      return;
    }

    setPressed(true);
    feedbackTimerRef.current = window.setTimeout(() => {
      setPressed(false);
      feedbackTimerRef.current = null;
      onClick();
    }, 110);
  };

  return (
    <button
      type="button"
      className={`bottom-button ${dark ? "dark" : ""} ${
        light ? "light" : ""
      } ${pressed ? "pressed" : ""}`}
      onPointerDown={() => setPressed(true)}
      onPointerLeave={stopPressFeedback}
      onPointerCancel={stopPressFeedback}
      onPointerUp={stopPressFeedback}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
