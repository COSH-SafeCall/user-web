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
  onCompleted,
  busy,
}: {
  go: Go;
  deletion: DeletionView | null;
  onCompleted: () => Promise<void>;
  busy: boolean;
}) {
  const status = deletion?.status ?? "PENDING";
  const isProcessing = status === "PENDING" || status === "PROCESSING";
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
    <Canvas className="deletion-status" layout="scroll">
      <Header
        title="탈퇴 처리 상태"
        back={status === "FAILED" ? () => go("setting") : undefined}
      />

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
        {isProcessing
          ? "서버의 삭제 작업 상태를 주기적으로 확인하고 있습니다. 처리 중에는 이 화면을 벗어날 수 없습니다."
          : status === "COMPLETED"
            ? "삭제가 완료되었습니다. 로그인 화면으로 이동하기 전에 세션을 안전하게 초기화합니다."
            : "삭제 요청이 완료되지 않았습니다. 설정 화면으로 돌아가 다시 시도해주세요."}
      </p>

      {isProcessing && (
        <BottomButton label="삭제 처리 중입니다" onClick={() => undefined} disabled />
      )}
      {status === "COMPLETED" && (
        <BottomButton
          label={busy ? "세션 확인 중..." : "로그인 화면으로 이동"}
          onClick={() => void onCompleted()}
          disabled={busy}
        />
      )}
      {status === "FAILED" && (
        <BottomButton label="설정으로 돌아가기" onClick={() => go("setting")} />
      )}
    </Canvas>
  );
}
