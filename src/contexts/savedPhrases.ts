import { useSyncExternalStore } from "react";
import { getSavedPhrases, savePhrase, unsavePhrase } from "../api/mypage/phrases";
import type { Phrase, PhraseSaveTarget, SavedPhrase } from "../api/phrases";

// 오프라인 표현 보관함(내 저장 표현) 공용 저장소.
// - 서버에서 받은 목록을 기기(localStorage)에도 저장해서, 인터넷이 끊겨도 마지막 목록을 보여준다.
// - 표현 카드는 여기서 "이미 저장한 표현인지"를 찾아 북마크를 켜 둔다. (안내문 해석 결과 등)
// - 저장/해제에 성공하면 여기와 기기 저장본을 같이 고친다.
// 다른 계정의 목록이 섞이지 않게 이메일과 함께 저장하고, 로그아웃하면 지운다.

const STORAGE_KEY = "savedPhrases";

type Cache = { email: string; phrases: SavedPhrase[] };

type State = {
  phrases: SavedPhrase[];
  synced: boolean; // 이번 접속에서 서버 목록을 받아왔는지 (false면 기기 저장본이거나 빈 목록)
};

let owner: string | null = null;
let state: State = { phrases: [], synced: false };
let refreshing: Promise<void> | null = null;
const listeners = new Set<() => void>();

function readCache(email: string): SavedPhrase[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const cache: Cache | null = saved ? JSON.parse(saved) : null;
    return cache?.email === email && Array.isArray(cache.phrases) ? cache.phrases : [];
  } catch {
    return [];
  }
}

function setState(next: State) {
  state = next;
  if (owner) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: owner, phrases: next.phrases } satisfies Cache));
    } catch {
      // 저장이 막힌 환경이면 이번 접속 동안만 기억한다.
    }
  }
  listeners.forEach((listener) => listener());
}

// 로그인한 사용자가 바뀌면 부른다. (AuthProvider) 같은 계정의 기기 저장본이 있으면 바로 보여준다.
export function setSavedPhrasesOwner(email: string | null) {
  if (email === owner) return;
  owner = email;
  refreshing = null;
  state = { phrases: email ? readCache(email) : [], synced: false };
  listeners.forEach((listener) => listener());
}

// 로그아웃할 때 기기 저장본까지 지운다.
export function clearSavedPhrases() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 지울 수 없으면 다음 로그인 때 이메일이 다르면 무시된다.
  }
  setSavedPhrasesOwner(null);
}

// 서버에서 최신 목록을 받아온다. 동시에 여러 번 불러도 요청은 한 번만 보낸다.
// 실패하면(오프라인 등) 기기 저장본을 그대로 두고 오류를 던진다.
export function refreshSavedPhrases(): Promise<void> {
  if (!refreshing) {
    const requestOwner = owner;
    refreshing = getSavedPhrases()
      .then((phrases) => {
        // 받는 사이에 로그아웃·계정 변경이 있었으면 버린다.
        if (owner === requestOwner) setState({ phrases, synced: true });
      })
      .finally(() => {
        // 끝나면 비워서, 보관함을 다시 열 때 새로 받아오게 한다.
        refreshing = null;
      });
  }
  return refreshing;
}

// 이번 접속에서 아직 서버 목록을 받지 않았으면 받아 둔다. (표현 카드가 저장 여부를 맞게 보여주려고)
export function ensureSavedPhrasesSynced() {
  if (!state.synced && owner) refreshSavedPhrases().catch((e) => console.warn(e));
}

const sameTarget = (a: PhraseSaveTarget, b: PhraseSaveTarget) =>
  a.sourceType === b.sourceType && a.sourceId === b.sourceId && (a.phraseIndex ?? null) === (b.phraseIndex ?? null);

// 한국어 문장 비교용 (앞뒤·연속 공백 차이는 무시)
const normalize = (text: string) => text.trim().replace(/\s+/g, " ");

// 이 표현이 이미 보관함에 있으면 그 ID. 없으면 undefined.
// 1) 같은 출처(종류·ID·순서)로 저장된 표현, 2) 없으면 한국어 문장이 같은 표현을 찾는다.
// 안내문은 같은 내용을 다시 해석해도 서버가 새 scanId를 주기 때문에, 문장으로도 찾아야 중복 저장을 막을 수 있다.
export function findSavedPhraseId(phrases: SavedPhrase[], phrase: Phrase) {
  const target = phrase.saveTarget;
  const byTarget = target && phrases.find((saved) => saved.saveTarget && sameTarget(saved.saveTarget, target));
  if (byTarget) return byTarget.savedPhraseId;
  const korean = normalize(phrase.korean);
  return phrases.find((saved) => normalize(saved.korean) === korean)?.savedPhraseId;
}

// 저장하고 목록 맨 앞(최근 저장순)에 넣는다. 저장된 표현의 ID를 돌려준다.
export async function addSavedPhrase(target: PhraseSaveTarget): Promise<number> {
  const saved = await savePhrase(target);
  setState({
    ...state,
    phrases: [saved, ...state.phrases.filter((phrase) => phrase.savedPhraseId !== saved.savedPhraseId)],
  });
  return saved.savedPhraseId;
}

// 해제하고 목록에서 뺀다.
export async function removeSavedPhrase(savedPhraseId: number) {
  await unsavePhrase(savedPhraseId);
  setState({ ...state, phrases: state.phrases.filter((phrase) => phrase.savedPhraseId !== savedPhraseId) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 저장한 표현 목록과 서버 동기화 여부
export function useSavedPhrases() {
  return useSyncExternalStore(subscribe, () => state);
}
