import type { FeedbackResult } from "./feedback";
import { sendMockScanFeedback } from "./mocks/scan";

// 안내문 해석은 서버에 연결됨 → api/scan/analyze.ts (텍스트만)

// 해석 피드백. 어떤 해석인지(scanId)와 피드백 내용을 함께 보낸다.
export type ScanFeedback = { scanId: string } & FeedbackResult;

// [임시] 서버 연결 전까지는 true. 서버가 준비되면 false로 바꾸고 mocks/scan.ts를 지운다.
const USE_MOCK = true;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 해석 피드백을 보낸다. 서버(안): POST /scans/feedback
export async function sendScanFeedback(feedback: ScanFeedback): Promise<void> {
  if (USE_MOCK) return sendMockScanFeedback(feedback);

  const res = await fetch(`${BASE_URL}/scans/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });
  if (!res.ok) throw new Error(`의견을 보내지 못했어요 (${res.status})`);
}
