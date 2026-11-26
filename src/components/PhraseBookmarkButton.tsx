import { useEffect, useState } from "react";
import type { Phrase } from "../api/phrases";
import bookmarkIcon from "../assets/scan/bookmark.svg";
import bookmarkFillIcon from "../assets/scan/bookmark-fill.svg";
import { useT } from "../contexts/language";
import {
  addSavedPhrase,
  ensureSavedPhrasesSynced,
  findSavedPhraseId,
  removeSavedPhrase,
  useSavedPhrases,
} from "../contexts/savedPhrases";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 표현을 오프라인 표현 보관함에 저장/해제하는 동그란 북마크 버튼. (표현 카드, AI 답변에서 같이 쓴다)
// 출처(saveTarget)를 모르는 표현은 저장할 수 없어서 버튼을 그리지 않는다.
export default function PhraseBookmarkButton({ phrase }: { phrase: Phrase }) {
  const t = useT();
  const canSave = phrase.saveTarget !== undefined;
  // 이미 저장한 표현인지는 보관함 저장소에서 찾는다. (같은 출처 → 같은 한국어 문장 순)
  // 보관함 목록의 표현은 자기 ID 그대로, 이 버튼으로 방금 저장했으면 서버가 준 ID를 쓴다.
  const { phrases: savedPhrases } = useSavedPhrases();
  const [justSavedId, setJustSavedId] = useState<number>();
  const justSavedAlive = justSavedId !== undefined && savedPhrases.some((p) => p.savedPhraseId === justSavedId);
  const savedId =
    phrase.savedPhraseId ?? (justSavedAlive ? justSavedId : undefined) ?? findSavedPhraseId(savedPhrases, phrase);
  // 누르자마자 바뀐 모습을 보여주려고, 요청 중에는 이 값을 우선한다.
  const [pending, setPending] = useState<boolean | null>(null);
  const saved = pending ?? savedId !== undefined;

  // 이번 접속에서 아직 서버 목록을 안 받았으면 받아 둔다. (그 전에는 기기 저장본으로 표시)
  useEffect(() => {
    if (canSave) ensureSavedPhrasesSynced();
  }, [canSave]);

  // 성공하면 저장소가 바뀌어 표시가 유지되고, 실패하면 저장소 값(원래 상태)으로 돌아간다.
  // 요청 중에 또 누르면 무시한다. (저장 ID를 받기 전에 해제 요청이 나가지 않게)
  const toggle = async () => {
    if (pending !== null || !phrase.saveTarget) return;
    const next = !saved;
    setPending(next);
    try {
      if (next) setJustSavedId(await addSavedPhrase(phrase.saveTarget));
      else if (savedId !== undefined) await removeSavedPhrase(savedId);
    } catch (e) {
      console.error(e);
    } finally {
      setPending(null);
    }
  };

  if (!canSave) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? t("표현 저장 해제", "Remove from saved") : t("표현 저장", "Save phrase")}
      aria-pressed={saved}
      className={`flex size-[min(2rem,32px)] shrink-0 items-center justify-center rounded-full border ${
        saved ? "border-[#E07A5F] bg-[#E07A5F]" : "border-[rgba(43,33,24,0.1)] bg-white"
      }`}
    >
      {saved ? (
        <img src={bookmarkFillIcon} alt="" style={{ width: size(15), height: size(14) }} />
      ) : (
        <img src={bookmarkIcon} alt="" style={{ width: size(11), height: size(13) }} />
      )}
    </button>
  );
}
