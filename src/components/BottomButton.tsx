import "./styles/BottomButton.css";
import { useEffect, useRef, useState } from "react";

type BottomButtonProps = {
  label: string;
  onClick: () => void;
  dark?: boolean;
  light?: boolean;
  disabled?: boolean;
  immediate?: boolean;
};

export function BottomButton({
  label,
  onClick,
  dark,
  light,
  disabled,
  immediate,
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
    if (disabled || feedbackTimerRef.current !== null) {
      return;
    }

    setPressed(true);

    if (immediate) {
      onClick();
      feedbackTimerRef.current = window.setTimeout(() => {
        setPressed(false);
        feedbackTimerRef.current = null;
      }, 110);
      return;
    }

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
      disabled={disabled}
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
