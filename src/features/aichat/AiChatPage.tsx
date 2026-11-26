import { useEffect, useRef, useState } from "react";
import { askAi, getChatMessages } from "../../api/aichat/chat";
import type { ChatMessage } from "../../api/aichat/types";
import { useT } from "../../contexts/language";
import AnswerCard from "./components/AnswerCard";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import SessionPanel from "./components/SessionPanel";
import SuggestionChips from "./components/SuggestionChips";
import TypingIndicator from "./components/TypingIndicator";

// 화면에 그리는 메시지: 서버 메시지 + 화면에서만 쓰는 오류 안내
// 오류 문구는 그릴 때 정해서, 언어를 바꾸면 같이 바뀌게 한다.
type Message = ChatMessage | { id: string; from: "error"; kind: "answer" | "load" };

// AI 여행 도우미 대화 화면 (/aichat)
// 들어오면 새 대화로 시작한다. 헤더의 "지난 대화"에서 예전 대화방을 골라 이어서 물어볼 수 있다.
export default function AiChatPage() {
  const t = useT();
  // 지금 대화방. null이면 새 대화 → 첫 질문을 보내면 서버가 만든 ID로 바뀐다.
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // 답변을 기다리는 중 (점점점 표시, 보내기 막기)
  const [waiting, setWaiting] = useState(false);
  // 지난 대화를 불러오는 중
  const [loadingSession, setLoadingSession] = useState(false);
  const [showingHistory, setShowingHistory] = useState(false);
  const nextLocalId = useRef(0);
  // 대화방을 빠르게 바꿨을 때 늦게 온 이전 대화방 메시지로 덮어쓰지 않게, 마지막으로 부른 대화방을 기억한다.
  const latestSessionRequest = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const localId = () => `local-${nextLocalId.current++}`;

  // 새 메시지나 점점점이 생기면 맨 아래로 스크롤한다.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, waiting]);

  const send = async (question: string) => {
    if (waiting || loadingSession) return;
    // 내 질문은 바로 보여주고, 답변이 오면 그 아래에 붙인다.
    setMessages((prev) => [...prev, { id: localId(), from: "user", text: question }]);
    setWaiting(true);
    try {
      const turn = await askAi(question, sessionId);
      setSessionId(turn.sessionId);
      setMessages((prev) => [...prev, turn.answer]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { id: localId(), from: "error", kind: "answer" }]);
    } finally {
      setWaiting(false);
    }
  };

  const openSession = async (id: number) => {
    setShowingHistory(false);
    if (id === sessionId) return;
    latestSessionRequest.current = id;
    setSessionId(id);
    setMessages([]);
    setLoadingSession(true);
    try {
      const loaded = await getChatMessages(id);
      if (latestSessionRequest.current === id) setMessages(loaded);
    } catch (e) {
      console.error(e);
      if (latestSessionRequest.current === id) setMessages([{ id: localId(), from: "error", kind: "load" }]);
    } finally {
      if (latestSessionRequest.current === id) setLoadingSession(false);
    }
  };

  const startNewChat = () => {
    setShowingHistory(false);
    latestSessionRequest.current = null;
    setSessionId(null);
    setMessages([]);
    setLoadingSession(false);
  };

  return (
    // 화면 높이에서 하단 Nav(App의 main 아래 여백)만큼 뺀 높이를 헤더 + 대화 + 입력창이 나눠 쓴다.
    <div className="flex h-[calc(100svh-min(3.8125rem,61px)-env(safe-area-inset-bottom))] flex-col">
      <ChatHeader onOpenHistory={() => setShowingHistory(true)} historyDisabled={waiting} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[min(1rem,16px)] px-[min(1rem,16px)] py-[min(1.25rem,20px)]">
          <MessageBubble from="ai">
            {t(
              "안녕하세요, 한국 여행 도우미예요. 여기서 어떻게 행동하면 되는지 무엇이든 물어보세요 — 짧고 친절하게 알려드릴게요.",
              "Hi, I'm your Korea travel assistant. Ask me anything about how to act here — I'll keep it short and friendly.",
            )}
          </MessageBubble>

          {/* 추천 질문은 새 대화를 시작하기 전에만 보여준다. */}
          {sessionId === null && messages.length === 0 && <SuggestionChips onSelect={send} />}

          {messages.map((message) => {
            if (message.from === "ai") return <AnswerCard key={message.id} answer={message.answer} />;
            if (message.from === "error")
              return (
                <MessageBubble key={message.id} from="ai">
                  {message.kind === "load"
                    ? t("지난 대화를 불러오지 못했어요.", "Couldn't load this chat.")
                    : t(
                        "답변을 받지 못했어요. 잠시 후 다시 물어봐 주세요.",
                        "Couldn't get an answer. Please ask again in a moment.",
                      )}
                </MessageBubble>
              );
            return (
              <MessageBubble key={message.id} from={message.from === "user" ? "user" : "ai"}>
                {message.text}
              </MessageBubble>
            );
          })}

          {(waiting || loadingSession) && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput onSend={send} sendDisabled={waiting || loadingSession} />

      {showingHistory && (
        <SessionPanel
          currentSessionId={sessionId}
          onSelect={openSession}
          onNewChat={startNewChat}
          onClose={() => setShowingHistory(false)}
        />
      )}
    </div>
  );
}
