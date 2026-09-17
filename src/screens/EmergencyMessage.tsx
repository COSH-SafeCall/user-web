import "./styles/EmergencyMessage.css";
import { useState } from "react";
import { MdAdd, MdCheckCircle, MdLocationOn, MdSend } from "react-icons/md";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import {
  fixedEmergencyContacts,
  fixedUserProfile,
} from "../fixedUserData";
import type { Go } from "../types";

const demoMessage = `[SafeCall 긴급 메시지]
${fixedUserProfile.name}님이 현재 도움이 필요한 상황입니다.
안전을 확인한 뒤 연락해 주세요.

현재 위치: 위치 확인 링크가 여기에 추가됩니다.`;

export function EmergencyMessage({ go }: { go: Go }) {
  const [message, setMessage] = useState(demoMessage);
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  return (
    <Canvas className="emergency-message">
      <Header title="새 긴급 메시지" back={() => go("home")} />

      <section className="message-recipients" aria-label="메시지 수신자">
        <span className="message-field-label">받는 사람</span>
        <div className="recipient-list">
          {fixedEmergencyContacts.map((contact) => (
            <span className="recipient-chip" key={contact.name}>
              {contact.name}
              <small>{contact.relation}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="message-draft-preview">
        <div className="message-demo-badge">미리보기 · 실제 전송 안 됨</div>
        <div className="message-preview-icon" aria-hidden="true">
          <MdCheckCircle />
        </div>
        <h2>긴급 메시지가 자동으로 작성되었습니다.</h2>
        <p>API 연동 후에는 서버에서 받은 메시지 내용이 이곳에 입력됩니다.</p>
        <div className="message-location-preview">
          <MdLocationOn aria-hidden="true" />
          <span>위치 권한이 허용되면 현재 위치 링크가 추가됩니다.</span>
        </div>
      </section>

      <section className="message-composer" aria-label="긴급 메시지 작성 영역">
        <button
          type="button"
          className="message-add-button"
          aria-label="첨부 항목 추가"
        >
          <MdAdd aria-hidden="true" />
        </button>
        <label className="message-input-wrap">
          <span className="sr-only">긴급 메시지 내용</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label="긴급 메시지 내용"
          />
        </label>
        <button
          type="button"
          className="message-send-button"
          onClick={() => setShowDemoNotice(true)}
          disabled={message.trim().length === 0}
          aria-label="긴급 메시지 전송 체험"
        >
          <MdSend aria-hidden="true" />
        </button>
      </section>

      {showDemoNotice && (
        <div className="message-demo-layer" role="dialog" aria-modal="true">
          <div className="message-demo-dialog">
            <h2>데모 메시지입니다.</h2>
            <p>
              실제 메시지 앱이나 전송 API를 호출하지 않았습니다. 작성 화면만
              체험할 수 있습니다.
            </p>
            <button type="button" onClick={() => setShowDemoNotice(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </Canvas>
  );
}
