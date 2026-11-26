import type { Phrase } from "../phrases";

// AI 답변 한 개 (서버 응답에서 화면에 쓰는 값만 골라 바꾼 것)
export type AiAnswer = {
  id: string; // 답변 messageId. 피드백을 보낼 때 어떤 답변인지 알려주기 위한 값
  summary: string; // 맨 위 한 줄 요약
  doList: string[]; // 해야 할 행동
  avoidList: string[]; // 피해야 할 행동
  lookFor: string; // 현장에서 확인하세요
  phrase: Phrase; // 유용한 한국어 표현 (보관함 저장 정보 포함)
};

// 대화 화면의 메시지 한 개
// - user: 내 질문 / ai: 답변 카드 / aiText: 정해진 형식이 없는 답변(서버가 answerDetail 없이 글만 준 경우)
export type ChatMessage =
  | { id: string; from: "user"; text: string }
  | { id: string; from: "ai"; answer: AiAnswer }
  | { id: string; from: "aiText"; text: string };

// 질문 한 번의 결과
export type ChatTurn = {
  sessionId: number; // 새 대화였으면 서버가 새로 만든 대화방 ID
  question: ChatMessage;
  answer: ChatMessage;
};

// 지난 대화 목록의 대화방 한 개
export type ChatSession = {
  sessionId: number;
  title: string;
  updatedAt: string; // ISO 문자열
};

export type ChatSessionPage = {
  sessions: ChatSession[];
  hasMore: boolean;
};

// ---- 서버 응답 형태 ----

// 서버 메시지 (Message)
export type MessageResponse = {
  messageId: number;
  senderType: "USER" | "ASSISTANT";
  content: string;
  answerDetail: {
    summary: string;
    do_actions: string[];
    avoid_actions: string[];
    look_for: string;
    phrase: { korean: string; romanization: string; english: string };
  } | null;
  createdAt: string;
};

// POST /api/ai/chat 응답 data (Turn)
export type TurnResponse = {
  sessionId: number;
  question: MessageResponse;
  answer: MessageResponse;
};

// GET /api/chat/sessions 응답 data
export type SessionPageResponse = {
  items: { sessionId: number; title: string; createdAt: string; updatedAt: string }[];
  page: number;
  totalPages: number;
};

// GET /api/chat/sessions/{sessionId}/messages 응답 data
export type MessagePageResponse = {
  items: MessageResponse[];
  page: number;
  totalPages: number;
};
