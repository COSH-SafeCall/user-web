import "./styles/DeletionStatus.css";
import { MdCheck, MdHourglassTop } from "react-icons/md";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";

const deletionSteps = [
  { label: "삭제 요청 접수", state: "done" },
  { label: "계정 데이터 삭제 중", state: "current" },
  { label: "삭제 완료", state: "waiting" },
] as const;

export function DeletionStatus({ go }: { go: Go }) {
  return (
    <Canvas className="deletion-status">
      <Header title="탈퇴 처리 상태" back={() => go("setting")} />

      <section className="deletion-status-card">
        <div className="deletion-status-icon" aria-hidden="true">
          <MdHourglassTop />
        </div>
        <span className="deletion-status-badge">처리 중</span>
        <h1>계정 삭제 요청을 접수했습니다.</h1>
        <p>
          서버가 저장된 계정 데이터를 순서대로 삭제합니다. 처리가 완료되면
          이 계정으로 다시 로그인할 수 없습니다.
        </p>

        <ol className="deletion-status-steps">
          {deletionSteps.map((step) => (
            <li className={step.state} key={step.label}>
              <span aria-hidden="true">
                {step.state === "done" ? <MdCheck /> : null}
              </span>
              <b>{step.label}</b>
            </li>
          ))}
        </ol>
      </section>

      <p className="deletion-status-note">
        현재는 상태 화면 UI만 구현되어 있습니다. API 연동 시 `R03` 응답에 따라
        처리 상태가 갱신됩니다.
      </p>

      <BottomButton label="로그인 화면으로 이동" onClick={() => go("login")} />
    </Canvas>
  );
}
