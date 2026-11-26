import { ApiError, apiRequest } from "../client";
import { FeedbackAlreadySentError, type FeedbackResult, toFeedbackBody } from "../feedback";
import { markFeedbackSent } from "../feedbackSent";

// POST /api/ai-feedback { messageId, helpful, reasonTags?, comment? }
// AI 답변(messageId) 하나에 대한 피드백. 이유는 여러 개를 reasonTags로 보낸다.
// (예전 단일 값 errorReason도 스웨거에 남아 있지만 reasonTags로 대체돼서 보내지 않는다)
export async function sendAiFeedback(messageId: number, result: FeedbackResult): Promise<void> {
  try {
    await apiRequest("/api/ai-feedback", { method: "POST", body: { messageId, ...toFeedbackBody(result) } });
    // 보낸 뒤에는 새로고침해도 다시 평가하지 못하게 기기에 기억한다.
    markFeedbackSent("ai", messageId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 409 || e.code === "DUPLICATE_RESOURCE")) {
      markFeedbackSent("ai", messageId);
      throw new FeedbackAlreadySentError();
    }
    throw e;
  }
}
