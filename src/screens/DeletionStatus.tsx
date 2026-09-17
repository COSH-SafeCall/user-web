import "./styles/DeletionStatus.css";
import { MdCheck, MdHourglassTop } from "react-icons/md";
import type { DeletionView } from "../api/contracts";
import { BottomButton } from "../components/BottomButton";
import { Canvas } from "../components/Canvas";
import { Header } from "../components/Header";
import type { Go } from "../types";

export function DeletionStatus({
  go,
  deletion,
}: {
  go: Go;
  deletion: DeletionView | null;
}) {
  const status = deletion?.status ?? "PENDING";
  const deletionSteps = [
    { label: "삭제 요청 접수", state: "done" },
    {
      label: "계정 데이터 삭제 중",
      state:
        status === "PENDING"
          ? "waiting"
          : status === "PROCESSING"
            ? "current"
            : "done",
    },
    {
      label: status === "FAILED" ? "삭제 처리 실패" : "삭제 완료",
      state:
        status === "COMPLETED"
          ? "done"
          : status === "FAILED"
            ? "current"
            : "waiting",
    },
  ] as const;
  return (
    <Canvas className="deletion-status">
      <Header title="탈퇴 처리 상태" back={() => go("setting")} />

      <section className="deletion-status-card">
        <div className="deletion-status-icon" aria-hidden="true">
          <MdHourglassTop />
        </div>
        <span className="deletion-status-badge">
          {status === "COMPLETED"
            ? "처리 완료"
            : status === "FAILED"
              ? "처리 실패"
              : "처리 중"}
        </span>
        <h1>
          {status === "COMPLETED"
            ? "계정 삭제가 완료되었습니다."
            : status === "FAILED"
              ? "계정 삭제를 완료하지 못했습니다."
              : "계정 삭제 요청을 접수했습니다."}
        </h1>
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
        서버의 삭제 작업 상태를 주기적으로 확인하고 있습니다.
      </p>

      <BottomButton label="로그인 화면으로 이동" onClick={() => go("login")} />
    </Canvas>
  );
}
