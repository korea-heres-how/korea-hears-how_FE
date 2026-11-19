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
