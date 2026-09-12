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
  return (
    <div className="contact-modal">
      <h2>연락처 추가</h2>
      <ModalField label="이름" value="홍길동" />
      <ModalField label="관계" value="가족" />
      <ModalField label="전화번호" value="010-0000-0000" />
      <button onClick={() => go("contacts")}>추가</button>
    </div>
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
      <input defaultValue={value} />
    </label>
  );
}
