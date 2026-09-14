import "../components/styles/Avatar.css";
import "./styles/Contacts.css";
import { useState } from "react";
import { MdPerson } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import { useScale } from "../hooks/useScale";
import type { Go } from "../types";

type ContactsProps = {
  go: Go;
  modal?: boolean;
  edit?: boolean;
};

const phonePattern = /^010-\d{4}-\d{4}$/;

function isValidPhoneNumber(phone: string) {
  return phonePattern.test(phone.trim());
}

export function Contacts({ go, modal, edit }: ContactsProps) {
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
        className={`contact-area ${modal ? "under-modal" : ""} ${
          edit ? "edit" : ""
        }`}
      >
        <ContactCard />
        <button className="plus" onClick={() => go("contactModal")}>
          <Icon name="add" size={40} />
        </button>
      </section>
      {!edit && <BottomButton label="다음" onClick={() => go("terms")} />}
      {modal && (
        <div className="modal-layer">
          <ContactModal go={go} />
        </div>
      )}
    </Canvas>
  );
}

function ContactCard() {
  return (
    <div className="contact-card">
      <div className="avatar">
        <MdPerson className="profile-person-icon" aria-hidden="true" />
      </div>
      <div>
        <b>보호자 1</b>
        <span>관계</span>
      </div>
    </div>
  );
}

function ContactModal({ go }: { go: Go }) {
  const [name, setName] = useState("보호자 2");
  const [relation, setRelation] = useState("어머니");
  const [phone, setPhone] = useState("010-0000-0000");
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

    go("contacts");
  };

  const changeName = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError(false);
    }
  };

  const changePhone = (value: string) => {
    setPhone(value);
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
        <button type="button" onClick={() => go("contacts")}>
          취소
        </button>
        <button type="button" onClick={addContact}>
          추가
        </button>
      </div>
    </div>
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
