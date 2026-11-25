// 로그인에 성공하면 앱에 보관하는 값
export type LoginResult = {
  accessToken: string;
  email: string;
};

// 서버 응답 data 중 화면에서 쓰는 필드만 적어둔다.
export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: { email: string };
};

// 로그인 실패 종류. 화면은 이 값으로 어떤 안내를 띄울지 고른다.
// - wrong: 이메일 또는 비밀번호가 틀림 (401 INVALID_CREDENTIALS)
// - invalidEmail: 이메일 형식이 아님 (400 INVALID_INPUT)
// - unavailable: 로그인할 수 없는 계정 — 탈퇴·정지 등 (ACCOUNT_UNAVAILABLE)
// - network: 서버에 연결하지 못함
// - server: 그 밖의 서버 오류 (5xx 등)
export type LoginFailReason = "wrong" | "invalidEmail" | "unavailable" | "network" | "server";

// ---- 회원가입 ----

// 인증번호 검증 응답 data. 기존 미인증 계정을 인증한 경우에는 서버가 data=null을 준다.
export type SignupVerificationResponse = {
  signupToken: string; // 최종 가입에 쓰는 일회용 토큰 (로그·URL·영구 저장 금지)
  expiresIn: number; // 토큰 유효 시간(초), 보통 600
} | null;

// 가입 전 프로필 사진 업로드 응답 data
export type SignupProfileImageResponse = {
  profileImageUrl: string; // "/api/profile-images/{uuid}.png" 상대경로. 가입 요청에 그대로 넘긴다.
};

// 서버가 받는 앱 언어 (앱은 KO/EN만 쓴다)
export type AppLanguage = "KO" | "EN";

// POST /api/auth/signup 요청 본문
export type SignupBody = {
  email: string;
  password: string;
  name: string;
  loginType: "EMAIL";
  appLanguage: AppLanguage;
  signupToken: string;
  profileImageUrl?: string; // 사진이 없으면 생략
};

// 인증번호 확인 실패 종류
// - wrong: 인증번호가 틀림 (VERIFICATION_INVALID)
// - expired: 인증번호 유효 시간이 지남 (VERIFICATION_EXPIRED)
// - tooMany: 틀린 횟수가 너무 많음 (VERIFICATION_ATTEMPTS_EXCEEDED)
export type InvalidCodeReason = "wrong" | "expired" | "tooMany";

// 회원가입 실패 종류
// - taken: 이미 가입된 이메일 (DUPLICATE_RESOURCE)
// - tokenExpired: 인증 후 시간이 지나 가입 토큰이 만료·무효 (INVALID_TOKEN / VERIFICATION_EXPIRED) → 이메일 인증부터 다시
// - photo: 프로필 사진이 거부됨 (형식·용량·크기)
// - other: 그 밖의 실패
export type SignupFailReason = "taken" | "tokenExpired" | "photo" | "other";
