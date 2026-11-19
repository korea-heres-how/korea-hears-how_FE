import { ApiError, apiRequest } from "../client";
import type { LoginFailReason, LoginResponse, LoginResult } from "./types";

// 로그인 실패 오류. reason으로 어떤 안내를 띄울지 고른다. (종류는 types.ts의 LoginFailReason)
export class LoginFailedError extends Error {
  reason: LoginFailReason;

  constructor(reason: LoginFailReason, message: string) {
    super(message);
    this.name = "LoginFailedError";
    this.reason = reason;
  }
}

function toReason(e: ApiError): LoginFailReason {
  if (e.code === "INVALID_CREDENTIALS" || e.status === 401) return "wrong";
  if (e.code === "INVALID_INPUT" || e.status === 400) return "invalidEmail";
  if (e.code === "ACCOUNT_UNAVAILABLE") return "unavailable";
  if (e.code === "NETWORK_ERROR") return "network";
  return "server";
}

// POST /api/auth/login
// 이메일 인증을 마친 계정만 로그인된다. 틀리면 401 { code: "INVALID_CREDENTIALS" }.
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const data = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return { accessToken: data.accessToken, email: data.user.email };
  } catch (e) {
    if (e instanceof ApiError) throw new LoginFailedError(toReason(e), e.message);
    throw e;
  }
}
