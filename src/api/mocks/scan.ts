import type { ScanFeedback } from "../scan";

// [임시] 해석 피드백은 아직 서버에 연결하지 않았다.

const MOCK_FEEDBACK_DELAY_MS = 300;

export function sendMockScanFeedback(feedback: ScanFeedback): Promise<void> {
  console.info("[mock] 해석 피드백 전송", feedback);
  return new Promise((resolve) => setTimeout(resolve, MOCK_FEEDBACK_DELAY_MS));
}
