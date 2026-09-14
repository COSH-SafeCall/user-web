import "../components/styles/Avatar.css";
import "./styles/Contacts.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MdPerson } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export type EmergencyContact = {
  id: number;
  name: string;
  relation: string;
  phone: string;
};

type ContactsProps = {
  go: Go;
  contacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, "id">) => void;
  modal?: boolean;
  edit?: boolean;
};

const phonePattern = /^010-\d{4}-\d{4}$/;

function isValidPhoneNumber(phone: string) {
  return phonePattern.test(phone.trim());
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function Contacts({
  go,
  contacts,
  onAddContact,
  modal,
  edit,
}: ContactsProps) {
  const canAddContact = contacts.length < 2;

  return (
    <Canvas className="contacts" style={useScale()}>
      {edit && <Header title="비상 연락처 수정" back={() => go("setting")} />}
      {!edit && (
        <div className="contact-copy">
          <h1>긴급 연락처를 입력해주세요.</h1>
          <p>
            저장된 연락처로 긴급 연락(현재 내 위치를 전송합니다)을 발송할
            수 있습니다. 최대 2명까지 입력 가능합니다.
          </p>
          <b>
            {modal ? "• " : ""}
            연락처를 아무것도 입력하지 않을 시 긴급 연락 기능을 사용할 수
            없습니다
          </b>
        </div>
      )}
      <section
        className={`contact-area ${contacts.length === 0 ? "empty" : ""} ${
          modal ? "under-modal" : ""
        } ${edit ? "edit" : ""}`}
      >
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
        {canAddContact && (
          <FeedbackButton
            className="plus"
            ariaLabel="비상 연락처 추가"
            onClick={() => go("contactModal")}
          >
            <Icon name="add" size={40} />
          </FeedbackButton>
        )}
      </section>
      {!edit && <BottomButton label="다음" onClick={() => go("terms")} />}
      {modal && (
        <div className="modal-layer">
          <ContactModal go={go} onAddContact={onAddContact} />
        </div>
      )}
    </Canvas>
  );
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  return (
    <div className="contact-card">
      <div className="avatar">
        <MdPerson className="profile-person-icon" aria-hidden="true" />
      </div>
      <div>
        <b>{contact.name}</b>
        <span>{contact.relation}</span>
      </div>
    </div>
  );
}

function ContactModal({
  go,
  onAddContact,
}: {
  go: Go;
  onAddContact: (contact: Omit<EmergencyContact, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const addContact = () => {
    const hasNameError = name.trim().length === 0;
    const hasPhoneError = !isValidPhoneNumber(phone);

    setNameError(hasNameError);
    setPhoneError(hasPhoneError);

    if (hasNameError || hasPhoneError) {
      return;
    }

    onAddContact({
      name: name.trim(),
      relation: relation.trim() || "관계",
      phone,
    });
    go("contacts");
  };

  const changeName = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError(false);
    }
  };

  const changePhone = (value: string) => {
    setPhone(formatPhoneInput(value));
    if (phoneError) {
      setPhoneError(false);
    }
  };

  return (
    <div className="contact-modal">
      <button
        className="contact-modal-menu"
        aria-label="연락처 추가 옵션"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      <ModalField
        label="이름"
        value={name}
        onChange={changeName}
        error={nameError ? "이름을 빈칸으로 둘 수 없습니다." : undefined}
      />
      <ModalField label="관계" value={relation} onChange={setRelation} />
      <ModalField
        label="전화번호"
        value={phone}
        onChange={changePhone}
        error={phoneError ? "전화번호의 형식이 올바르지 않습니다." : undefined}
      />
      <div className="contact-modal-actions">
        <FeedbackButton
          className="contact-action-button"
          onClick={() => go("contacts")}
        >
          취소
        </FeedbackButton>
        <FeedbackButton className="contact-action-button" onClick={addContact}>
          추가
        </FeedbackButton>
      </div>
    </div>
  );
}

function FeedbackButton({
  children,
  className,
  ariaLabel,
  onClick,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
  onClick: () => void;
}) {
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
      className={`${className} ${pressed ? "pressed" : ""}`}
      type="button"
      aria-label={ariaLabel}
      onPointerDown={() => setPressed(true)}
      onPointerLeave={stopPressFeedback}
      onPointerCancel={stopPressFeedback}
      onPointerUp={stopPressFeedback}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function ModalField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className={`modal-field ${error ? "error" : ""}`}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <small>{error}</small>}
    </label>
  );
}
