import { useT } from "../../../contexts/language";

// 서버가 아직 내용을 주지 않는 탭·섹션에 넣는 "준비 중" 안내
export default function ComingSoon({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <div
      className={`rounded-[min(0.75rem,12px)] border border-[rgba(43,33,24,0.1)] bg-white px-[min(1rem,16px)] py-[min(1.5rem,24px)] text-center ${className}`}
    >
      <p className="text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-medium text-[rgba(43,33,24,0.55)]">
        {t("이 장소의 가이드는 준비 중이에요", "The guide for this place is coming soon.")}
      </p>
      <p className="pt-[min(0.125rem,2px)] text-[min(0.6875rem,11px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.35)]">
        {t("The guide for this place is coming soon.", "이 장소의 가이드는 준비 중이에요")}
      </p>
    </div>
  );
}
