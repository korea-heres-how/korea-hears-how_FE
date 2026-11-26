import { apiRequest } from "../client";
import type { LocalizedText, SignAnalysisResponse, SignExplanation } from "./types";

// 서버가 안내문으로 인식하지 못했을 때(unreadable / not_a_sign) 던지는 오류.
// serverMessage: 서버가 준 한/영 안내 문구 (없으면 null → 화면의 기본 문구를 쓴다)
export class SignNotRecognizedError extends Error {
  status: string;
  serverMessage: LocalizedText | null;

  constructor(status: string, serverMessage: LocalizedText | null) {
    super(`안내문으로 인식하지 못했어요 (${status})`);
    this.name = "SignNotRecognizedError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// POST /api/signs/analyze { text }
// 텍스트(1~500자)로 안내문을 해석한다. 사진 해석은 아직 연결하지 않았다. (서버가 사진을 받는지 확인 필요)
export async function analyzeSignText(text: string): Promise<SignExplanation> {
  const data = await apiRequest<SignAnalysisResponse>("/api/signs/analyze", { method: "POST", body: { text } });

  if (data.status !== "ok" || data.scanId === null) {
    throw new SignNotRecognizedError(data.status, data.message?.ko && data.message?.en ? data.message : null);
  }

  const id = String(data.scanId);
  return {
    id,
    title: data.originalText,
    titleEn: data.englishTranslation,
    meaning: data.meaning.ko,
    meaningEn: data.meaning.en,
    action: data.actionGuide.ko,
    actionEn: data.actionGuide.en,
    // 서버 표현에는 ID가 없어서 해석 ID + 순서로 붙인다.
    // 보관함 저장은 서버가 0·1번째 표현만 받아서, 그 둘에만 저장 정보를 붙인다. (나머지는 북마크 버튼이 숨겨짐)
    phrases: data.phrases.map((phrase, i) => ({
      id: `${id}-${i}`,
      ...phrase,
      saveTarget: i <= 1 ? { sourceType: "SIGN_SCAN", sourceId: data.scanId!, phraseIndex: i } : undefined,
    })),
    whereSeen: data.whereToSee.ko,
    whereSeenEn: data.whereToSee.en,
  };
}
