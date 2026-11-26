import { useCallback, useEffect, useRef, useState } from "react";
import { getScannedSigns } from "../../api/mypage/signs";
import type { ScannedSign } from "../../api/mypage/types";
import scan from "../../assets/mypage/scan.svg";
import ErrorToast from "../../components/ErrorToast";
import { useT } from "../../contexts/language";
import ResultModal from "../scan/components/ResultModal";
import ListPageLayout from "./components/ListPageLayout";
import SignCard from "./components/SignCard";
import { useSignDetail } from "./components/useSignDetail";

// 한 번에 불러오는 개수. 맨 아래까지 내리면 다음 페이지를 이어 붙인다.
const PAGE_SIZE = 20;

// 마이페이지 스캔한 안내문 "전체 보기" 화면 (/mypage/scans)
export default function ScannedSignsPage() {
  const t = useT();
  const [signs, setSigns] = useState<ScannedSign[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<"loading" | "done" | "failed">("loading");
  const loadingRef = useRef(false);
  const nextPageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const signDetail = useSignDetail();

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await getScannedSigns(nextPageRef.current, PAGE_SIZE);
      nextPageRef.current += 1;
      // 페이지 사이에 새 해석이 생기면 같은 기록이 두 번 올 수 있어서 겹치는 건 뺀다.
      setSigns((prev) => [
        ...prev,
        ...result.signs.filter((sign) => !prev.some((p) => p.scanId === sign.scanId)),
      ]);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("failed");
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // 첫 페이지
  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  // 목록 맨 아래 기준점이 화면에 보이면 다음 페이지를 부른다.
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, status, loadMore, signs]);

  const emptyText = {
    loading: "",
    done: t("스캔한 안내문이 없습니다.", "No scanned signs yet."),
    failed: t("스캔한 안내문을 불러오지 못했어요.", "Couldn't load your scanned signs."),
  }[status];

  return (
    <>
      {signDetail.failed && (
        <ErrorToast
          message={t("해석 결과를 불러오지 못했어요.", "Couldn't open this sign.")}
          onClose={signDetail.closeError}
        />
      )}
      <ListPageLayout
        icon={scan}
        title={t("스캔한 안내문", "Scanned signs")}
        sub={t("Scanned signs", "스캔한 안내문")}
        description={t(
          "사진을 찍거나 입력해서 해석한 안내문 기록이에요.",
          "Signs you've photographed or typed in to get explained.",
        )}
        count={total}
        emptyText={emptyText}
      >
        {signs.map((sign) => (
          <SignCard
            key={sign.scanId}
            sign={sign}
            onOpen={signDetail.open}
            opening={signDetail.openingId === sign.scanId}
          />
        ))}
        {status === "failed" && (
          <p className="py-[min(0.75rem,12px)] text-center text-[min(0.75rem,12px)] text-[rgba(43,33,24,0.45)]">
            {t("더 불러오지 못했어요.", "Couldn't load more.")}
          </p>
        )}
        {/* 다음 페이지를 부르는 기준점 */}
        {hasMore && status === "done" && <div ref={sentinelRef} className="h-px" />}
      </ListPageLayout>
      {signDetail.detail && <ResultModal result={signDetail.detail} onClose={signDetail.close} />}
    </>
  );
}
