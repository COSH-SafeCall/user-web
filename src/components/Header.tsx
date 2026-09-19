import "./styles/Header.css";
import { Icon } from "./Icon";

type HeaderProps = {
  title: string;
  back?: () => void;
};

export function Header({ title, back }: HeaderProps) {
  return (
    <header className="header">
      {back ? (
        <button className="icon-button" onClick={back}>
          <Icon name="keyboard_arrow_left" size={28} />
        </button>
      ) : (
        <span className="header-back-placeholder" aria-hidden="true" />
      )}
      <h1>{title}</h1>
    </header>
  );
}

