import { apiRequest } from "../client";
import { toUtcIso } from "../dates";
import type {
  ChatMessage,
  ChatSessionPage,
  ChatTurn,
  MessagePageResponse,
  MessageResponse,
  SessionPageResponse,
  TurnResponse,
} from "./types";

// 서버가 한 번에 주는 최대 개수
const MAX_PAGE_SIZE = 50;

// 서버 메시지를 대화 화면 메시지로 바꾼다.
export function toChatMessage(message: MessageResponse): ChatMessage {
  const id = String(message.messageId);
  if (message.senderType === "USER") return { id, from: "user", text: message.content };

  const detail = message.answerDetail;
  if (!detail) return { id, from: "aiText", text: message.content };
  return {
    id,
    from: "ai",
    answer: {
      id,
      summary: detail.summary,
      doList: detail.do_actions,
      avoidList: detail.avoid_actions,
      lookFor: detail.look_for,
      phrase: {
        id: `${id}-phrase`,
        ...detail.phrase,
        // AI 답변의 표현은 답변 messageId를 출처로 보관함에 저장한다.
        saveTarget: { sourceType: "AI_CHAT", sourceId: message.messageId },
      },
    },
  };
}

// POST /api/ai/chat { sessionId?, message }
// 질문을 보내고 답변을 받는다. sessionId가 없으면 서버가 새 대화방을 만든다. (이전 대화는 서버가 알아서 붙인다)
// (Idempotency-Key 헤더는 선택이라 보내지 않는다. 앱이 같은 요청을 자동으로 다시 보내지 않기 때문)
export async function askAi(message: string, sessionId: number | null): Promise<ChatTurn> {
  const data = await apiRequest<TurnResponse>("/api/ai/chat", {
    method: "POST",
    body: sessionId === null ? { message } : { sessionId, message },
  });
  return {
    sessionId: data.sessionId,
    question: toChatMessage(data.question),
    answer: toChatMessage(data.answer),
  };
}

// GET /api/chat/sessions?page&page_size
// 지난 대화 목록 한 페이지
export async function getChatSessions(page: number, pageSize: number): Promise<ChatSessionPage> {
  const data = await apiRequest<SessionPageResponse>("/api/chat/sessions", {
    query: { page, page_size: pageSize },
  });
  return {
    sessions: data.items.map((item) => ({
      sessionId: item.sessionId,
      title: item.title,
      updatedAt: toUtcIso(item.updatedAt ?? item.createdAt),
    })),
    hasMore: data.page < data.totalPages,
  };
}

// GET /api/chat/sessions/{sessionId}/messages?page&page_size
// 대화방의 메시지를 50개씩 끝 페이지까지 모두 받아 오래된 순으로 돌려준다.
// (서버 정렬 순서가 정해져 있지 않아서 보낸 시각·ID로 직접 정렬한다)
export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const items: MessageResponse[] = [];
  for (let page = 1; ; page++) {
    const data = await apiRequest<MessagePageResponse>(`/api/chat/sessions/${sessionId}/messages`, {
      query: { page, page_size: MAX_PAGE_SIZE },
    });
    items.push(...data.items);
    if (data.page >= data.totalPages) break;
  }
  items.sort(
    (a, b) =>
      new Date(toUtcIso(a.createdAt)).getTime() - new Date(toUtcIso(b.createdAt)).getTime() ||
      a.messageId - b.messageId,
  );
  return items.map(toChatMessage);
}
