import { ApiError, apiRequest } from "../client";
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

// 서버가 사진을 거부했을 때 던지는 오류.
// - invalid: JPEG·PNG·WebP 안내문 사진이 아님 (400 INVALID_SIGN_IMAGE)
// - tooLarge: 사진 크기 제한 초과 (413 SIGN_IMAGE_TOO_LARGE)
export class SignImageRejectedError extends Error {
  reason: "invalid" | "tooLarge";

  constructor(reason: "invalid" | "tooLarge", message: string) {
    super(message);
    this.name = "SignImageRejectedError";
    this.reason = reason;
  }
}

// 사진 또는 텍스트 중 하나만 보낸다.
export type AnalyzeSignInput = { photo: File } | { text: string };

// POST /api/signs/analyze
// - 텍스트: JSON { text } (1~500자)
// - 사진: multipart { image } (JPEG·PNG·WebP)
export async function analyzeSign(input: AnalyzeSignInput): Promise<SignExplanation> {
  let body: FormData | { text: string };
  if ("photo" in input) {
    body = new FormData();
    body.append("image", input.photo);
  } else {
    body = { text: input.text };
  }

  let data: SignAnalysisResponse;
  try {
    data = await apiRequest<SignAnalysisResponse>("/api/signs/analyze", { method: "POST", body });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.code === "INVALID_SIGN_IMAGE") throw new SignImageRejectedError("invalid", e.message);
      if (e.code === "SIGN_IMAGE_TOO_LARGE" || e.status === 413) throw new SignImageRejectedError("tooLarge", e.message);
    }
    throw e;
  }

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
