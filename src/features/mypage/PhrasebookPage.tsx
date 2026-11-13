import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { clearSavedPhrases, getSavedPhrases, type PhraseCategory, type SavedPhrase } from "../../api/phrases";
import aiOrange from "../../assets/mypage/ai-orange.svg";
import cloud from "../../assets/mypage/cloud.svg";
import offline from "../../assets/mypage/offline.svg";
import pos from "../../assets/mypage/pos.svg";
import trash from "../../assets/mypage/trash.svg";
import bookmarkIcon from "../../assets/scan/bookmark.svg";
import CategoryChips from "../../components/CategoryChips";
import ErrorToast from "../../components/ErrorToast";
import PhraseCard from "../../components/PhraseCard";
import { useT } from "../../contexts/language";
import ConfirmDialog from "./components/ConfirmDialog";
import SubPageLayout from "./components/SubPageLayout";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 분류 칩: 지도 화면 카테고리 + 분류가 없는 표현을 모으는 "기타"
const FILTERS: ("전체" | PhraseCategory)[] = ["전체", "관광지", "문화시설", "음식점", "시장", "카페", "기타"];

const categoryOf = (phrase: SavedPhrase): PhraseCategory => phrase.category ?? "기타";

// 마이페이지 "오프라인 표현 보관함" 화면 (/mypage/phrasebook)
// 카드의 주황 북마크를 누르면 저장이 해제되면서 목록에서 빠진다.
export default function PhrasebookPage() {
  const navigate = useNavigate();
  const t = useT();
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  // 팝업이 떠 있는지만 저장해서, 언어를 바꾸면 문구도 같이 바뀌게 한다.
  const [toast, setToast] = useState(false);
  const closeToast = useCallback(() => setToast(false), []);

  useEffect(() => {
    getSavedPhrases()
      .then(setPhrases)
      .catch((e) => console.error(e))
      .finally(() => setLoaded(true));
  }, []);

  const countOf = (item: (typeof FILTERS)[number]) =>
    item === "전체" ? phrases.length : phrases.filter((phrase) => categoryOf(phrase) === item).length;

  const visible = filter === "전체" ? phrases : phrases.filter((phrase) => categoryOf(phrase) === filter);

  const removePhrase = (id: string) => setPhrases((prev) => prev.filter((phrase) => phrase.id !== id));

  const clearAll = async () => {
    setClearing(true);
    try {
      await clearSavedPhrases();
      setPhrases([]);
      setFilter("전체");
    } catch (e) {
      console.error(e);
      setToast(true);
    } finally {
      setClearing(false);
      setConfirmingClear(false);
    }
  };

  return (
    <SubPageLayout
      icon={offline}
      title={t("오프라인 표현 보관함", "Offline Phrasebook")}
      sub={t("Offline Phrasebook", "오프라인 표현 보관함")}
    >
      {toast && (
        <ErrorToast
          message={t("삭제하지 못했어요. 잠시 후 다시 시도해 주세요.", "Couldn't delete. Please try again in a moment.")}
          onClose={closeToast}
        />
      )}

      {/* 안내 */}
      <div className="mt-[min(0.75rem,12px)] flex items-center gap-[min(0.625rem,10px)] rounded-[min(0.5rem,8px)] border border-[rgba(43,33,24,0.1)] bg-[rgba(241,230,210,0.3)] px-[min(0.875rem,14px)] py-[min(0.625rem,10px)]">
        <img src={cloud} alt="" className="shrink-0" style={{ width: size(17), height: size(16) }} />
        <p className="text-[min(0.75rem,12px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.65)]">
          {t(
            "인터넷 없이도 저장한 한국어 표현을 확인할 수 있어요.",
            "See your saved Korean phrases even without internet.",
          )}
        </p>
      </div>

      {loaded && phrases.length === 0 ? (
        <EmptyState onBrowse={() => navigate("/map")} onAskAi={() => navigate("/aichat")} />
      ) : (
        <>
          {/* 개수 + 전체 삭제 */}
          <div className="flex items-center justify-between pt-[min(1rem,16px)]">
            <p className="text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[rgba(43,33,24,0.55)]">
              {t("저장한 표현", "Saved phrases")}{" "}
              <span className="font-semibold text-[rgba(43,33,24,0.8)]">
                {t(`${phrases.length}개`, `${phrases.length}`)}
              </span>
            </p>
            {phrases.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="flex items-center gap-[min(0.25rem,4px)] text-[min(0.75rem,12px)] leading-[min(1.125rem,18px)] text-[rgba(43,33,24,0.5)]"
              >
                <img src={trash} alt="" style={{ width: size(13), height: size(12) }} />
                {t("전체 삭제", "Delete all")}
              </button>
            )}
          </div>

          {/* 분류 칩 */}
          <CategoryChips
            className="pt-[min(0.75rem,12px)]"
            items={FILTERS.map((item) => ({ value: item, count: countOf(item) }))}
            selected={filter}
            onSelect={setFilter}
          />

          {/* 표현 목록 */}
          {visible.length === 0 ? (
            <p className="py-[min(1.5rem,24px)] text-center text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] text-[rgba(43,33,24,0.35)]">
              {t("이 분류에 저장한 표현이 없어요.", "No saved phrases in this category.")}
            </p>
          ) : (
            <div className="flex flex-col gap-[min(0.5rem,8px)] pt-[min(1rem,16px)]">
              {visible.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  onSavedChange={(saved) => !saved && removePhrase(phrase.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {confirmingClear && (
        <ConfirmDialog
          title={t("저장한 표현을 모두 삭제할까요?", "Delete all saved phrases?")}
          message={t(
            "보관함에 저장한 표현이 모두 사라지고 되돌릴 수 없어요.",
            "All phrases in your phrasebook will be removed. This can't be undone.",
          )}
          confirmLabel={t("전체 삭제", "Delete all")}
          busy={clearing}
          onCancel={() => setConfirmingClear(false)}
          onConfirm={clearAll}
        />
      )}
    </SubPageLayout>
  );
}

// 저장한 표현이 하나도 없을 때
function EmptyState({ onBrowse, onAskAi }: { onBrowse: () => void; onAskAi: () => void }) {
  const t = useT();
  const bookmark = (
    <img
      src={bookmarkIcon}
      alt={t("북마크", "bookmark")}
      className="inline-block align-[-0.1em] opacity-55"
      style={{ width: size(10), height: size(12) }}
    />
  );
  return (
    <div className="mt-[min(1.25rem,20px)] flex flex-col items-center rounded-[min(0.875rem,14px)] border border-[rgba(43,33,24,0.07)] bg-white px-[min(1.5rem,24px)] py-[min(3rem,48px)] text-center">
      <span className="flex size-[min(4rem,64px)] items-center justify-center rounded-[min(0.875rem,14px)] bg-[rgba(224,122,95,0.1)]">
        <img src={offline} alt="" style={{ width: size(31), height: size(30) }} />
      </span>
      <h2 className="pt-[min(1rem,16px)] text-[min(1.0625rem,17px)] leading-[min(1.59375rem,25.5px)] font-semibold text-[#2B2118]">
        {t("아직 저장한 표현이 없어요", "No saved phrases yet")}
      </h2>
      <p className="pt-[min(0.5rem,8px)] text-[min(0.8125rem,13px)] leading-[min(1.3203rem,21.125px)] break-keep text-[rgba(43,33,24,0.55)]">
        {t(
          <>
            관광지 상세나 AI 가이드에서 표현 옆의 {bookmark} 북마크를 누르면 여기에 저장돼요.
            <br />
            저장한 표현은 인터넷이 없어도 언제든 확인할 수 있어요.
          </>,
          <>
            Tap the {bookmark} bookmark next to a phrase in a place guide or the AI guide to save it here.
            <br />
            You can check saved phrases anytime, even without internet.
          </>,
        )}
      </p>
      <div className="flex w-full flex-col gap-[min(0.625rem,10px)] pt-[min(1.5rem,24px)]">
        <button
          type="button"
          onClick={onBrowse}
          className="flex h-[min(2.46875rem,39.5px)] items-center justify-center gap-[min(0.5rem,8px)] rounded-full bg-[#E07A5F] text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-medium text-[#F1E6D2]"
        >
          <img src={pos} alt="" style={{ width: size(14), height: size(13) }} />
          {t("관광지 둘러보기", "Browse places")}
        </button>
        <button
          type="button"
          onClick={onAskAi}
          className="flex h-[min(2.59375rem,41.5px)] items-center justify-center gap-[min(0.5rem,8px)] rounded-full border border-[rgba(43,33,24,0.1)] bg-white text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-medium text-[#2B2118]"
        >
          <img src={aiOrange} alt="" style={{ width: size(14), height: size(13) }} />
          {t("AI 가이드에게 묻기", "Ask the AI guide")}
        </button>
      </div>
    </div>
  );
}
