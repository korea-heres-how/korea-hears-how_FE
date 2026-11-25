import type { InvalidCodeReason } from "./auth/types";
import { mockResetPassword, mockSendResetCode, mockVerifyCode } from "./mocks/auth";

// 비밀번호 찾기 / 회원가입에서 인증번호 확인에 실패했을 때 던지는 오류. reason: 틀림·만료·시도 초과 (auth/types.ts)
export class InvalidCodeError extends Error {
  reason: InvalidCodeReason;

  constructor(reason: InvalidCodeReason = "wrong") {
    super("인증번호가 올바르지 않아요");
    this.name = "InvalidCodeError";
    this.reason = reason;
  }
}

// [임시] 비밀번호 찾기는 아직 서버 연결 전이라 true. 연결하면 false로 바꾸고 mocks/auth.ts를 지운다.
const USE_MOCK = true;

// 비밀번호 찾기 인증번호 보내기. 서버(안): POST /auth/password-reset/code { email } — 경로·형식은 백엔드와 협의 필요
export async function sendResetCode(email: string): Promise<void> {
  if (USE_MOCK) return mockSendResetCode();

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password-reset/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`인증번호를 보내지 못했어요 (${res.status})`);
}

// 인증번호 확인. 서버(안): POST /auth/password-reset/verify { email, code }
export async function verifyResetCode(email: string, code: string): Promise<void> {
  if (USE_MOCK) return mockVerifyCode(code);

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password-reset/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (res.status === 400) throw new InvalidCodeError();
  if (!res.ok) throw new Error(`인증번호를 확인하지 못했어요 (${res.status})`);
}

// 새 비밀번호로 변경. 서버(안): POST /auth/password-reset { email, code, password }
export async function resetPassword(email: string, code: string, password: string): Promise<void> {
  if (USE_MOCK) return mockResetPassword();

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password }),
  });
  if (!res.ok) throw new Error(`비밀번호를 바꾸지 못했어요 (${res.status})`);
}
