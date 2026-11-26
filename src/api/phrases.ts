// 여러 화면(안내문 해석, 관광지 상세, 오프라인 표현 보관함 등)에서 같이 쓰는 한국어 표현 타입.
// 저장·삭제·목록 API는 api/mypage/phrases.ts

// 표현이 어디서 나왔는지 (서버 sourceType)
export type PhraseSourceType = "PLACE_GUIDE" | "AI_CHAT" | "SIGN_SCAN";

// 서버의 저장 표현 분류
export type ServerPhraseCategory = "RESTAURANT" | "TRANSPORT" | "SHOPPING" | "ETC";

// 표현을 보관함에 저장할 때 서버에 보내는 출처 정보.
// 서버가 원본을 찾아 사본을 만들기 때문에, 출처를 알 수 있는 표현만 저장할 수 있다.
export type PhraseSaveTarget = {
  sourceType: PhraseSourceType;
  sourceId: number; // 안내문 해석이면 scanId
  phraseIndex?: number; // 안내문 해석(SIGN_SCAN)만 필요. 0 또는 1
  category?: ServerPhraseCategory;
};

// "이렇게 말해보세요" 한국어 표현 한 개
export type Phrase = {
  id: string; // 화면에서 목록 key로만 쓴다
  korean: string; // 이거 잠깐 맡길 수 있어요?
  romanization: string; // i-geo jam-kkan mat-gil su i-sseo-yo?
  english: string; // Can I leave this here for a moment?
  saveTarget?: PhraseSaveTarget; // 있으면 북마크로 저장할 수 있다. 없으면 북마크 버튼을 숨긴다.
  savedPhraseId?: number; // 이미 보관함에 저장된 표현이면 그 ID (해제할 때 쓴다)
};

// 보관함 분류 칩 값. 서버 분류를 한국어 키로 바꿔 둔다. (영어 표시는 contexts/labels.ts)
export type PhraseCategory = "음식점" | "교통" | "쇼핑" | "기타";

// 오프라인 표현 보관함에 저장된 표현
export type SavedPhrase = Phrase & {
  savedPhraseId: number;
  category: PhraseCategory;
};
