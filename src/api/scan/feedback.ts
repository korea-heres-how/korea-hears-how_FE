import { ApiError, apiRequest } from "../client";
import { FeedbackAlreadySentError, type FeedbackResult, toFeedbackBody } from "../feedback";
import { markFeedbackSent } from "../feedbackSent";

// POST /api/signs/{scanId}/feedback { helpful, reasonTags?, comment? }
// 해석 하나에 피드백은 한 번만. 이미 보냈으면 409 → FeedbackAlreadySentError
// 이유는 서로 다른 것 최대 4개(화면 선택지도 4개), 의견은 최대 500자.
export async function sendScanFeedback(scanId: number, result: FeedbackResult): Promise<void> {
  try {
    await apiRequest(`/api/signs/${scanId}/feedback`, { method: "POST", body: toFeedbackBody(result) });
    // 보낸 뒤에는 새로고침해도 다시 평가하지 못하게 기기에 기억한다.
    markFeedbackSent("scan", scanId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 409 || e.code === "DUPLICATE_RESOURCE")) {
      markFeedbackSent("scan", scanId);
      throw new FeedbackAlreadySentError();
    }
    throw e;
  }
}
