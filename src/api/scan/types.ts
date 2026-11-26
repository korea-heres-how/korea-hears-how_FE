import type { Phrase } from "../phrases";

// 안내문 해석 결과 (서버 응답에서 화면에 쓰는 값만 골라 바꾼 것)
// 한/영 둘 다 받아 두고 화면에서 고른 언어에 맞춰 고른다. (언어를 바꾸면 바로 바뀌도록)
export type SignExplanation = {
  id: string; // scanId. 피드백을 보낼 때 어떤 해석인지 알려주기 위한 값
  title: string; // 안내문 원문 (외부 음식 반입 금지)
  titleEn: string; // 영어 번역 (No outside food allowed)
  meaning: string; // 1. 이 안내문의 뜻 — 쉬운 설명
  meaningEn: string;
  action: string; // 2. 그래서 어떻게 해야 하나요?
  actionEn: string;
  phrases: Phrase[]; // 3. 이렇게 말해보세요
  whereSeen: string; // 이런 곳에서 볼 수 있어요
  whereSeenEn: string;
};

// 서버가 주는 한/영 문구
export type LocalizedText = { ko: string; en: string };

// POST /api/signs/analyze 응답 data (Detail) 중 화면에서 쓰는 필드만.
// status가 "ok"일 때만 저장돼서 scanId가 오고, unreadable/not_a_sign이면 scanId가 null이다.
// (sourceType, notice, thumbnailUrl, createdAt도 오지만 아직 쓰는 화면이 없어서 뺐다)
export type SignAnalysisResponse = {
  scanId: number | null;
  status: string; // "ok" | "unreadable" | "not_a_sign"
  originalText: string;
  englishTranslation: string;
  meaning: LocalizedText;
  actionGuide: LocalizedText;
  phrases: { korean: string; romanization: string; english: string }[];
  whereToSee: LocalizedText;
  message: LocalizedText | null; // 해석하지 못했을 때 사용자에게 보여줄 안내
};
