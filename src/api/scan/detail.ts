import { apiRequest } from "../client";
import { toSignExplanation } from "./analyze";
import type { SignAnalysisResponse, SignExplanation } from "./types";

// GET /api/signs/{scanId}
// 예전에 해석한 안내문 하나를 다시 연다. 응답은 해석 직후(POST /api/signs/analyze)와 같은 형태라 같은 팝업에 띄운다.
// 내 기록이 아니거나 없는 기록이면 404.
export async function getSignDetail(scanId: number): Promise<SignExplanation> {
  const data = await apiRequest<SignAnalysisResponse>(`/api/signs/${scanId}`);
  return toSignExplanation(data, scanId);
}
