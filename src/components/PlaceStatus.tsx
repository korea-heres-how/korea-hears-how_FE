type PlaceStatusProps = {
  // 운영 상태 문구. 서버가 이미 고른 언어로 주므로 번역하지 않고 그대로 보여준다.
  status: string;
  // 서버 business_status.color → 점 색
  color: "green" | "red" | "gray";
  className?: string;
};

const DOT_COLOR = {
  green: "bg-[#A9BBA0]",
  red: "bg-[#E07A5F]",
  gray: "bg-[rgba(43,33,24,0.3)]",
};

// 장소 사진 위에 얹는 운영 상태 알약.
export default function PlaceStatus({ status, color, className = "" }: PlaceStatusProps) {
  return (
    <span
      className={`flex max-w-[calc(100%-min(1rem,16px))] items-center gap-[min(0.25rem,4px)] rounded-full bg-[rgba(251,246,234,0.9)] px-[min(0.5rem,8px)] py-[min(0.125rem,2px)] ${className}`}
    >
      <span className={`size-[min(0.375rem,6px)] shrink-0 rounded-full ${DOT_COLOR[color]}`} />
      <span className="truncate">{status}</span>
    </span>
  );
}
