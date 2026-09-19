import "../components/styles/Avatar.css";
import "./styles/Contacts.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MdDeleteOutline, MdPerson } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import {
  fixedEmergencyContacts,
  type FixedEmergencyContact,
} from "../fixedUserData";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

export type EmergencyContact = {
  id: string;
  slot: 1 | 2;
  name: string;
  relation: string;
  phone: string;
  version: number;
};

type ContactsProps = {
  go: Go;
  contacts: EmergencyContact[];
  onAddContact: (contact: FixedEmergencyContact) => Promise<void>;
  onDeleteContact: (contact: EmergencyContact) => Promise<void>;
  modal?: boolean;
  edit?: boolean;
};

export function Contacts({
  go,
  contacts,
  onAddContact,
  onDeleteContact,
  modal,
  edit,
}: ContactsProps) {
  const canAddContact = contacts.length < 2;
  const [pendingDeleteContact, setPendingDeleteContact] =
    useState<EmergencyContact | null>(null);

  return (
    <Canvas className="contacts" layout="scroll" style={useScale()}>
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
          <ContactCard
            key={contact.id}
            contact={contact}
            deletable={Boolean(edit)}
            onDelete={() => setPendingDeleteContact(contact)}
          />
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
      {!edit && (
        <BottomButton label="다음" onClick={() => go("permissionBasic")} />
      )}
      {modal && canAddContact && (
        <div className="modal-layer">
          <ContactModal
            go={go}
            contact={fixedEmergencyContacts[contacts.length]}
            onAddContact={onAddContact}
          />
        </div>
      )}
      {edit && pendingDeleteContact && (
        <div className="modal-layer">
          <section
            className="contact-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-delete-title"
          >
            <h2 id="contact-delete-title">긴급 연락처를 삭제할까요?</h2>
            <p>
              {pendingDeleteContact.name} 연락처가 목록에서 삭제됩니다. 삭제 후
              다시 추가할 수 있습니다.
            </p>
            <div>
              <button
                type="button"
                onClick={() => setPendingDeleteContact(null)}
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  void onDeleteContact(pendingDeleteContact)
                    .then(() => {
                      setPendingDeleteContact(null);
                    })
                    .catch(() => undefined);
                }}
              >
                삭제
              </button>
            </div>
          </section>
        </div>
      )}
    </Canvas>
  );
}

function ContactCard({
  contact,
  deletable,
  onDelete,
}: {
  contact: EmergencyContact;
  deletable: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="contact-card">
      <div className="avatar">
        <MdPerson className="profile-person-icon" aria-hidden="true" />
      </div>
      <div className="contact-card-info">
        <b>{contact.name}</b>
        <span>{contact.relation}</span>
      </div>
      {deletable && (
        <button
          type="button"
          className="contact-delete-button"
          onClick={onDelete}
          aria-label={`${contact.name} 연락처 삭제`}
        >
          <MdDeleteOutline aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function ContactModal({
  go,
  contact,
  onAddContact,
}: {
  go: Go;
  contact: FixedEmergencyContact;
  onAddContact: (contact: FixedEmergencyContact) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);

  const addContact = async () => {
    if (adding) {
      return;
    }

    setAdding(true);
    try {
      await onAddContact(contact);
      go("contacts");
    } catch {
      // 상위 공통 오류 모달을 유지하고 현재 추가 모달에 머뭅니다.
    } finally {
      setAdding(false);
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
      <ModalField label="이름" value={contact.name} />
      <ModalField label="관계" value={contact.relation} />
      <ModalField label="전화번호" value={contact.phone} />
      <div className="contact-modal-actions">
        <FeedbackButton
          className="contact-action-button"
          onClick={() => go("contacts")}
        >
          취소
        </FeedbackButton>
        <FeedbackButton
          className="contact-action-button"
          onClick={() => void addContact()}
          disabled={adding}
        >
          {adding ? "추가 중..." : "추가"}
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
  disabled,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
  onClick: () => void;
  disabled?: boolean;
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
    if (disabled || feedbackTimerRef.current !== null) {
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
      disabled={disabled}
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
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="modal-field">
      <span>{label}</span>
      <input value={value} readOnly />
    </label>
  );
}
