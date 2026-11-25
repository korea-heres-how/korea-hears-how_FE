import { InvalidCodeError } from "../auth";
import { ApiError, apiRequest } from "../client";
import type {
  SignupBody,
  SignupFailReason,
  SignupProfileImageResponse,
  SignupVerificationResponse,
} from "./types";

// 회원가입 실패 오류. reason으로 어떤 안내를 띄울지 고른다. (종류는 types.ts의 SignupFailReason)
export class SignupFailedError extends Error {
  reason: SignupFailReason;

  constructor(reason: SignupFailReason, message: string) {
    super(message);
    this.name = "SignupFailedError";
    this.reason = reason;
  }
}

// POST /api/auth/email-verifications { email }
// 회원가입 인증번호 발송. 보안상 이미 가입된 이메일이어도 같은 200 응답이라 여기서는 구분하지 않는다.
export async function sendSignupCode(email: string): Promise<void> {
  await apiRequest<string>("/api/auth/email-verifications", { method: "POST", body: { email } });
}

// POST /api/auth/email-verifications/verify { email, code }
// 맞으면 가입에 쓸 signupToken을 돌려준다. 기존 미인증 계정을 인증한 경우엔 null(이미 계정이 있어 로그인하면 됨).
// 틀리거나 만료되면 InvalidCodeError(reason으로 구분).
export async function verifySignupCode(email: string, code: string): Promise<SignupVerificationResponse> {
  try {
    return await apiRequest<SignupVerificationResponse>("/api/auth/email-verifications/verify", {
      method: "POST",
      body: { email, code },
    });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.code === "VERIFICATION_INVALID") throw new InvalidCodeError("wrong");
      if (e.code === "VERIFICATION_EXPIRED") throw new InvalidCodeError("expired");
      if (e.code === "VERIFICATION_ATTEMPTS_EXCEEDED") throw new InvalidCodeError("tooMany");
    }
    throw e;
  }
}

// POST /api/auth/signup/profile-image (multipart: email, signupToken, file)
// 가입 전에 사진을 먼저 올리고, 돌려받은 상대경로를 가입 요청에 넘긴다. JPG/PNG 최대 2MiB, 한 변 2048px·총 400만 픽셀 이하.
export async function uploadSignupProfileImage(email: string, signupToken: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("email", email);
  body.append("signupToken", signupToken);
  body.append("file", file);
  try {
    const data = await apiRequest<SignupProfileImageResponse>("/api/auth/signup/profile-image", {
      method: "POST",
      body,
    });
    return data.profileImageUrl;
  } catch (e) {
    if (e instanceof ApiError) throw new SignupFailedError(toReason(e, "photo"), e.message);
    throw e;
  }
}

// POST /api/auth/signup
// signupToken을 한 번 쓰고 인증된 계정을 만든다. 가입 후 로그인은 따로 한다.
export async function signup(body: Omit<SignupBody, "loginType">): Promise<void> {
  try {
    await apiRequest("/api/auth/signup", { method: "POST", body: { ...body, loginType: "EMAIL" } });
  } catch (e) {
    if (e instanceof ApiError) throw new SignupFailedError(toReason(e, "other"), e.message);
    throw e;
  }
}

// INVALID_INPUT은 사진 업로드면 사진 문제, 가입이면 그 밖의 실패로 본다.
function toReason(e: ApiError, invalidInput: SignupFailReason): SignupFailReason {
  if (e.code === "DUPLICATE_RESOURCE") return "taken";
  if (e.code === "INVALID_TOKEN" || e.code === "VERIFICATION_EXPIRED") return "tokenExpired";
  if (e.code === "INVALID_INPUT" || e.status === 400 || e.status === 413) return invalidInput;
  return "other";
}
