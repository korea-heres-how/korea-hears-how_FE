import { useCallback, useRef, useState } from "react";
import { getSignDetail } from "../../../api/scan/detail";
import type { SignExplanation } from "../../../api/scan/types";

// 스캔한 안내문 카드를 누르면 상세(GET /api/signs/{scanId})를 받아 해석 결과 팝업에 띄운다.
// 마이페이지 미리보기와 전체 보기에서 같이 쓴다.
export function useSignDetail() {
  const [detail, setDetail] = useState<SignExplanation | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const openingRef = useRef(false);

  const open = useCallback(async (scanId: number) => {
    // 불러오는 중에 다른 카드를 또 누르면 무시한다.
    if (openingRef.current) return;
    openingRef.current = true;
    setOpeningId(scanId);
    try {
      setDetail(await getSignDetail(scanId));
    } catch (e) {
      console.error(e);
      setFailed(true);
    } finally {
      openingRef.current = false;
      setOpeningId(null);
    }
  }, []);

  const close = useCallback(() => setDetail(null), []);
  const closeError = useCallback(() => setFailed(false), []);

  return { detail, openingId, failed, open, close, closeError };
}
