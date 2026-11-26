import type { ScannedSign } from "../../../api/mypage/types";
import arrow from "../../../assets/mypage/arrow-g.svg";
import { DEFAULT_PLACE_IMAGE } from "../../../components/placeImage";
import { type Language, useLanguage, useT } from "../../../contexts/language";
import Thumbnail from "./Thumbnail";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// "11월 13일" / "Nov 13"
function formatDate(iso: string, language: Language) {
  const date = new Date(iso);
  if (language === "en") return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type SignCardProps = {
  sign: ScannedSign;
  onOpen: (scanId: number) => void;
  opening?: boolean; // 이 카드의 상세를 불러오는 중
};

// 스캔한 안내문 카드 한 개. 누르면 그 해석 결과를 다시 띄운다.
// 사진: 사진 해석이고 서버가 썸네일을 주면 그 사진, 아니면 기본 이미지.
// 제목: 서버가 한국어 쉬운 설명 한 줄만 줘서 언어와 상관없이 그대로 보여준다.
export default function SignCard({ sign, onOpen, opening = false }: SignCardProps) {
  const t = useT();
  const { language } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => onOpen(sign.scanId)}
      disabled={opening}
      aria-busy={opening}
      className="flex w-full items-center gap-[min(0.75rem,12px)] rounded-[min(0.5rem,8px)] border border-[rgba(43,33,24,0.05)] bg-white px-[min(0.8125rem,13px)] py-[min(0.6875rem,11px)] text-left disabled:opacity-60"
    >
      <Thumbnail src={sign.imageUrl ?? DEFAULT_PLACE_IMAGE} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[min(0.875rem,14px)] leading-[min(1.3125rem,21px)] font-semibold text-[#2B2118]">
          {sign.title}
        </p>
        <p className="truncate pt-[min(0.125rem,2px)] text-[min(0.71875rem,11.5px)] leading-[min(1.078rem,17.25px)] text-[rgba(43,33,24,0.55)]">
          {[formatDate(sign.scannedAt, language), sign.fromPhoto ? t("사진", "Photo") : t("텍스트", "Text")].join(
            " · ",
          )}
        </p>
      </div>
      <img src={arrow} alt="" className="shrink-0" style={{ width: size(19), height: size(18) }} />
    </button>
  );
}
