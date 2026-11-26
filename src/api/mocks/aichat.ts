import type { AnswerFeedback } from "../aichat";

// [임시] AI 답변 피드백은 아직 서버에 연결하지 않아서 콘솔에만 남긴다.

const MOCK_FEEDBACK_DELAY_MS = 300;

export function sendMockFeedback(feedback: AnswerFeedback): Promise<void> {
  console.info("[mock] 피드백 전송", feedback);
  return new Promise((resolve) => setTimeout(resolve, MOCK_FEEDBACK_DELAY_MS));
}
