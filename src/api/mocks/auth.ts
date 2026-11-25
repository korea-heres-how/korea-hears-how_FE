import { InvalidCodeError } from "../auth";

// [임시] 비밀번호 찾기에서 통과되는 인증번호. 이메일 가입 여부와 상관없이 모두 통과한다.
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
