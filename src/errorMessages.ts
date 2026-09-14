import type { ReactNode } from "react";

export type RequirementErrorMessageKey =
  | "kakaoLoginFailed"
  | "oauthCallbackFailed"
  | "requiredUserInfoMissing"
  | "contactPhoneInvalid"
  | "emergencyContactMissing"
  | "requiredConsentDenied"
  | "micPermissionDenied"
  | "locationPermissionDenied"
  | "sosGuideFailed"
  | "testMessageFailed"
  | "networkFailed"
  | "safeMessageUnavailable"
  | "locationUnavailable"
  | "homeInfoLoadFailed"
  | "personaSituationRequired"
  | "personaPersonRequired"
  | "settingScreenLoadFailed"
  | "geminiConnectFailed"
  | "callAnswerFailed"
  | "aiResponseDelayed"
  | "micInputFailed"
  | "voiceOutputFailed"
  | "callConnectionLost"
  | "callRefreshEnded"
  | "safeMessageBuildFailed"
  | "abnormalCallEnd"
  | "permissionStatusCheckFailed"
  | "settingLoadFailed"
  | "settingSaveFailed"
  | "logoutFailed"
  | "dataDeleteFailed"
  | "browserChanged"
  | "unavailableCallControl";

type RequirementErrorMessage = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
};

export const requirementErrorMessages: Record<
  RequirementErrorMessageKey,
  RequirementErrorMessage
> = {
  kakaoLoginFailed: {
    title: "카카오 로그인에 실패하였습니다.",
    description: "네트워크 연결을 확인하시고 다시 시도해주세요.",
  },
  oauthCallbackFailed: {
    title: "로그인 결과를 확인할 수 없습니다.",
    description: "인증 정보를 저장하지 않았습니다. 로그인 화면에서 다시 시도해주세요.",
  },
  requiredUserInfoMissing: {
    title: "필수 사용자 정보를 확인할 수 없습니다.",
    description: "이름 또는 전화번호 정보를 다시 확인하거나 카카오 동의를 다시 진행해주세요.",
  },
  contactPhoneInvalid: {
    title: "전화번호 형식이 올바르지 않습니다.",
    description: "010-0000-0000 형식으로 입력한 뒤 다시 저장해주세요.",
  },
  emergencyContactMissing: {
    title: "비상 연락망이 등록되지 않았습니다.",
    description: "안심 메시지 기능은 사용할 수 없지만 AI 안심 통화는 이용할 수 있습니다.",
  },
  requiredConsentDenied: {
    title: "필수 동의가 필요합니다.",
    description: "개인정보 처리 및 AI 통화 이용 필수 항목에 동의해야 다음 단계로 이동할 수 있습니다.",
  },
  micPermissionDenied: {
    title: "마이크 권한이 허용되지 않았습니다.",
    description: "AI 안심 통화 이용이 제한될 수 있습니다. 브라우저 사이트 설정에서 마이크 권한을 허용해주세요.",
  },
  locationPermissionDenied: {
    title: "위치 권한이 허용되지 않았습니다.",
    description: "위치 링크 없이 안심 메시지를 작성할 수 있습니다. 위치 전송이 필요하면 브라우저 권한을 허용해주세요.",
  },
  sosGuideFailed: {
    title: "SOS 안내를 표시하지 못했습니다.",
    description: "페이지를 새로 고치거나 홈 화면에서 다시 시도해주세요.",
  },
  testMessageFailed: {
    title: "테스트 메시지를 구성하지 못했습니다.",
    description: "전화번호와 연락처 정보를 확인한 뒤 다시 시도해주세요.",
  },
  networkFailed: {
    title: "네트워크 연결에 실패했습니다.",
    description: "인터넷 연결 상태를 확인하고 다시 시도해주세요.",
  },
  safeMessageUnavailable: {
    title: "안심 메시지를 작성할 수 없습니다.",
    description: "비상 연락망 등록 화면으로 이동해 보호자 연락처를 먼저 등록해주세요.",
  },
  locationUnavailable: {
    title: "위치 정보를 포함할 수 없습니다.",
    description: "위치 권한이 없거나 차단되어 있습니다. 위치 링크 없이 안심 메시지를 준비할 수 있습니다.",
  },
  homeInfoLoadFailed: {
    title: "홈 정보를 불러오지 못했습니다.",
    description: "마지막으로 확인된 설정 상태를 표시합니다. 잠시 후 다시 불러와주세요.",
  },
  personaSituationRequired: {
    title: "상황을 선택해주세요.",
    description: "안심 통화를 사용할 상황을 선택한 뒤 다음 단계로 이동할 수 있습니다.",
  },
  personaPersonRequired: {
    title: "통화 상대를 선택해주세요.",
    description: "가상 통화를 받을 인물을 선택한 뒤 다음 단계로 이동할 수 있습니다.",
  },
  settingScreenLoadFailed: {
    title: "설정 화면을 불러오지 못했습니다.",
    description: "다시 불러오거나 홈 화면으로 돌아간 뒤 다시 시도해주세요.",
  },
  geminiConnectFailed: {
    title: "가상 통화를 준비하지 못했습니다.",
    description: "AI 연결에 실패했습니다. 다시 시도하거나 대체 통화를 시작해주세요.",
  },
  callAnswerFailed: {
    title: "통화를 시작하지 못했습니다.",
    description: "받기 처리가 실패했습니다. 다시 시도하거나 홈 화면으로 이동해주세요.",
  },
  aiResponseDelayed: {
    title: "AI 응답을 기다리고 있습니다.",
    description: "잠시만 기다려주세요. 필요한 경우 통화를 종료할 수 있습니다.",
  },
  micInputFailed: {
    title: "마이크 입력에 실패했습니다.",
    description: "마이크 상태와 브라우저 권한을 확인한 뒤 다시 연결해주세요.",
  },
  voiceOutputFailed: {
    title: "음성 출력이 원활하지 않습니다.",
    description: "스피커 또는 기기 음량을 확인하고 다시 시도해주세요.",
  },
  callConnectionLost: {
    title: "통화 연결이 중단되었습니다.",
    description: "기존 대화 문맥을 이어갈 수 없습니다. 새 통화를 시작하거나 통화를 종료해주세요.",
  },
  callRefreshEnded: {
    title: "통화가 종료되었습니다.",
    description: "페이지 새로고침 후에는 기존 통화를 자동 복원하지 않습니다. 홈 화면에서 새 통화를 시작해주세요.",
  },
  safeMessageBuildFailed: {
    title: "안심 메시지 내용을 구성하지 못했습니다.",
    description: "수신자와 사용자 정보를 다시 확인하거나 잠시 후 다시 시도해주세요.",
  },
  abnormalCallEnd: {
    title: "통화가 이미 끊겼습니다.",
    description: "종료 상태를 확인했습니다. 홈 화면에서 새 통화를 시작할 수 있습니다.",
  },
  permissionStatusCheckFailed: {
    title: "권한 상태 확인이 필요합니다.",
    description: "브라우저가 권한 상태 조회를 지원하지 않거나 조회에 실패했습니다. 실제 기능 사용 시 다시 확인합니다.",
  },
  settingLoadFailed: {
    title: "설정을 불러오지 못했습니다.",
    description: "마지막으로 확인된 상태를 표시합니다. 다시 불러오기를 시도해주세요.",
  },
  settingSaveFailed: {
    title: "설정을 저장하지 못했습니다.",
    description: "변경 전 상태를 유지했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
  },
  logoutFailed: {
    title: "로그아웃에 실패했습니다.",
    description: "로그인 상태를 유지했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
  },
  dataDeleteFailed: {
    title: "데이터 삭제에 실패했습니다.",
    description: "기존 데이터를 유지했습니다. 잠시 후 다시 시도해주세요.",
  },
  browserChanged: {
    title: "계정 확인이 필요합니다.",
    description: "새 브라우저 또는 기기에서는 카카오 로그인을 다시 진행해야 할 수 있습니다.",
  },
  unavailableCallControl: {
    title: "제공되지 않는 기능입니다.",
    description: "통화 종료를 제외한 나머지 기능은 현재 MVP에서 실제로 제공되지 않습니다.",
  },
};
