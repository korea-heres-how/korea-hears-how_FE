// [임시] 서버가 준비되기 전까지 쓰는 마이페이지 mock (회원 탈퇴만 남음)

const MOCK_DELAY_MS = 500;

export function deleteMockAccount(): Promise<void> {
  console.info("[mock] 회원 탈퇴");
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}
