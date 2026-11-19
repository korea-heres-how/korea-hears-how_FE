import { EmailTakenError, InvalidCodeError } from "../auth";

// [임시] 회원가입 mock에서 "이미 가입됨"으로 막는 이메일
const TAKEN_EMAIL = "admin@example.com";

// [임시] 비밀번호 찾기 / 회원가입에서 통과되는 인증번호.
// 비밀번호 찾기는 이메일 가입 여부와 상관없이 모두 통과하고, 회원가입은 TAKEN_EMAIL만 "이미 가입됨"으로 막는다.
const TEST_CODE = "123456";

const MOCK_DELAY_MS = 500;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

export async function mockSendResetCode(): Promise<void> {
  await wait();
}

export async function mockVerifyCode(code: string): Promise<void> {
  await wait();
  if (code !== TEST_CODE) throw new InvalidCodeError();
}

export async function mockResetPassword(): Promise<void> {
  await wait();
}

export async function mockSendSignupCode(email: string): Promise<void> {
  await wait();
  if (email === TAKEN_EMAIL) throw new EmailTakenError();
}

export async function mockSignup(): Promise<void> {
  await wait();
}
