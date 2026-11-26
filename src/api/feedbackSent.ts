// 피드백을 이미 보낸 안내문 해석(scanId)·AI 답변(messageId)을 기기(localStorage)에 기억한다.
// 서버 응답에는 "피드백을 보냈는지"가 없어서, 새로고침하거나 기록에서 다시 열어도 평가 버튼이 다시 뜨지 않게 하려고 쓴다.
// scanId·messageId는 그 계정에서만 열 수 있는 값이라 계정 정보 없이 ID만 저장한다.
// (다른 기기에서는 모르기 때문에 버튼이 뜰 수 있는데, 그때 보내면 서버가 409로 막아 준다)

const STORAGE_KEY = "feedbackSent";

export type FeedbackTarget = "scan" | "ai";

type Saved = Record<FeedbackTarget, number[]>;

function read(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return {
      scan: Array.isArray(saved?.scan) ? saved.scan : [],
      ai: Array.isArray(saved?.ai) ? saved.ai : [],
    };
  } catch {
    return { scan: [], ai: [] };
  }
}

export function hasSentFeedback(target: FeedbackTarget, id: number) {
  return read()[target].includes(id);
}

export function markFeedbackSent(target: FeedbackTarget, id: number) {
  const saved = read();
  if (saved[target].includes(id)) return;
  saved[target].push(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // 저장이 막힌 환경이면 새로고침 전까지만 막고, 그 뒤에는 서버의 409로 막힌다.
  }
}
