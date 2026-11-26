// AI 답변, 안내문 해석 등 여러 화면에서 같이 쓰는 "도움이 되었나요?" 피드백 형식

// "어떤 점이 아쉬웠나요?" 선택지
export const FEEDBACK_REASONS = [
  "잘못된 정보",
  "이해하기 어려움",
  "실제 장소와 다름",
  "기타",
] as const;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

// 도움됨이면 helpful: true만, 도움 안 됨이면 이유(1개 이상)와 추가 의견(선택)을 함께 보낸다.
export type FeedbackResult =
  | { helpful: true }
  | { helpful: false; reasons: FeedbackReason[]; comment?: string };

// 서버가 받는 이유 코드 (reasonTags). 화면 선택지와 순서대로 짝지어 둔다.
export type FeedbackReasonTag = "WRONG_INFO" | "HARD_TO_UNDERSTAND" | "NOT_MATCH_PLACE" | "OTHER";

const REASON_TAG: Record<FeedbackReason, FeedbackReasonTag> = {
  "잘못된 정보": "WRONG_INFO",
  "이해하기 어려움": "HARD_TO_UNDERSTAND",
  "실제 장소와 다름": "NOT_MATCH_PLACE",
  기타: "OTHER",
};

// 피드백 결과 → 서버 요청 본문의 공통 부분 { helpful, reasonTags?, comment? }
// 도움됨이면 이유를 비워야 해서 helpful만 보낸다. 같은 이유가 두 번 들어가지 않게 한다.
export function toFeedbackBody(result: FeedbackResult) {
  if (result.helpful) return { helpful: true };
  return {
    helpful: false,
    reasonTags: [...new Set(result.reasons.map((reason) => REASON_TAG[reason]))],
    ...(result.comment ? { comment: result.comment } : {}),
  };
}

// 이미 피드백을 보낸 답변·해석에 또 보냈을 때 (409 DUPLICATE_RESOURCE)
export class FeedbackAlreadySentError extends Error {
  constructor() {
    super("이미 의견을 보냈어요");
    this.name = "FeedbackAlreadySentError";
  }
}
