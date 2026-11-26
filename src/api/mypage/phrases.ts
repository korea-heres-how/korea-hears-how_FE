import type { PhraseCategory, PhraseSaveTarget, SavedPhrase, ServerPhraseCategory } from "../phrases";
import { apiRequest } from "../client";
import type { SavedPhrasePage, SavedPhraseResponse } from "./types";

// 서버가 한 번에 주는 최대 개수
const MAX_PAGE_SIZE = 50;

const CATEGORY: Record<ServerPhraseCategory, PhraseCategory> = {
  RESTAURANT: "음식점",
  TRANSPORT: "교통",
  SHOPPING: "쇼핑",
  ETC: "기타",
};

function toSavedPhrase(item: SavedPhraseResponse): SavedPhrase {
  return {
    id: `saved-${item.savedPhraseId}`,
    korean: item.korean,
    romanization: item.romanization,
    english: item.english,
    savedPhraseId: item.savedPhraseId,
    category: item.category ? CATEGORY[item.category] : "기타",
    // 보관함에서 해제한 뒤 다시 저장할 수 있게 출처를 같이 들고 있는다.
    saveTarget: {
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      phraseIndex: item.phraseIndex ?? undefined,
      category: item.category ?? undefined,
    },
  };
}

// POST /api/users/me/phrases { sourceType, sourceId, phraseIndex?, category? }
// 표현을 보관함에 저장하고, 저장된 표현(해제할 때 쓸 savedPhraseId 포함)을 돌려준다.
export async function savePhrase(target: PhraseSaveTarget): Promise<SavedPhrase> {
  const data = await apiRequest<SavedPhraseResponse>("/api/users/me/phrases", { method: "POST", body: target });
  return toSavedPhrase(data);
}

// DELETE /api/users/me/phrases/{savedPhraseId}
export async function unsavePhrase(savedPhraseId: number): Promise<void> {
  await apiRequest(`/api/users/me/phrases/${savedPhraseId}`, { method: "DELETE" });
}

// GET /api/users/me/phrases?page&page_size
// 최근 저장순. 보관함은 분류 칩 개수를 세야 해서 50개씩 끝 페이지까지 모두 받는다.
export async function getSavedPhrases(): Promise<SavedPhrase[]> {
  const phrases: SavedPhrase[] = [];
  for (let page = 1; ; page++) {
    const data = await apiRequest<SavedPhrasePage>("/api/users/me/phrases", {
      query: { page, page_size: MAX_PAGE_SIZE },
    });
    phrases.push(...data.items.map(toSavedPhrase));
    if (data.page >= data.totalPages) return phrases;
  }
}
