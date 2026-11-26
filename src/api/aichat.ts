import type { FeedbackResult } from "./feedback";
import { sendMockFeedback } from "./mocks/aichat";

// 질문·지난 대화는 서버에 연결됨 → api/aichat/chat.ts

// 답변 피드백. 어떤 답변인지(answerId = 답변 messageId)와 피드백 내용을 함께 보낸다.
export type AnswerFeedback = { answerId: string } & FeedbackResult;

// [임시] 피드백은 아직 서버에 연결하지 않았다. 서버(POST /api/ai-feedback)는 이유를 1개만 받아서 화면과 맞춘 뒤 연결한다.
export function sendFeedback(feedback: AnswerFeedback): Promise<void> {
  return sendMockFeedback(feedback);
}
