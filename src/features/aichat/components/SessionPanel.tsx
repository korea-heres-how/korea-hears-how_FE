import { useCallback, useEffect, useRef, useState } from "react";
import { getChatSessions } from "../../../api/aichat/chat";
import type { ChatSession } from "../../../api/aichat/types";
import closeIcon from "../../../assets/scan/x-black.svg";
import { type Language, useLanguage, useT } from "../../../contexts/language";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 한 번에 불러오는 개수. 목록 끝까지 내리면 다음 페이지를 이어 붙인다.
const PAGE_SIZE = 20;

// "11월 26일" / "Nov 26"
function formatDate(iso: string, language: Language) {
  const date = new Date(iso);
  if (language === "en") return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type SessionPanelProps = {
  currentSessionId: number | null;
  onSelect: (sessionId: number) => void;
  onNewChat: () => void;
  onClose: () => void;
};

// 헤더의 "지난 대화" 버튼을 누르면 뜨는 대화방 목록 (GET /api/chat/sessions)
// 맨 위 "새 대화"로 새로 시작하거나, 대화방을 골라 이어서 질문한다. 배경이나 X를 누르면 닫힌다.
export default function SessionPanel({ currentSessionId, onSelect, onNewChat, onClose }: SessionPanelProps) {
  const t = useT();
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<"loading" | "done" | "failed">("loading");
  const loadingRef = useRef(false);
  const nextPageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await getChatSessions(nextPageRef.current, PAGE_SIZE);
      nextPageRef.current += 1;
      setSessions((prev) => [
        ...prev,
        ...result.sessions.filter((session) => !prev.some((p) => p.sessionId === session.sessionId)),
      ]);
      setHasMore(result.hasMore);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("failed");
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, status, loadMore, sessions]);

  // 패널이 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게 막는다.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-panel-title"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex justify-end bg-[rgba(43,33,24,0.45)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[min(85%,360px)] flex-col bg-[#FBF6EA] shadow-[-4px_0_16px_rgba(43,33,24,0.08)]"
      >
        <div className="flex items-center justify-between border-b border-[rgba(43,33,24,0.06)] px-[min(1rem,16px)] py-[min(0.875rem,14px)]">
          <h2 id="session-panel-title" className="flex items-baseline gap-[min(0.25rem,4px)]">
            <span className="text-[min(1rem,16px)] leading-[min(1.5rem,24px)] font-bold text-[#2B2118]">
              {t("지난 대화", "Past chats")}
            </span>
            <span className="text-[min(0.6875rem,11px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.4)]">
              {t("Past chats", "지난 대화")}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("닫기", "Close")}
            className="flex size-[min(2rem,32px)] items-center justify-center rounded-full"
          >
            <img src={closeIcon} alt="" style={{ width: size(21), height: size(20) }} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-[min(1rem,16px)]">
          <button
            type="button"
            onClick={onNewChat}
            className="flex h-[min(2.75rem,44px)] w-full items-center justify-center gap-[min(0.375rem,6px)] rounded-[min(0.5rem,8px)] bg-[#E07A5F] text-[min(0.84375rem,13.5px)] leading-[min(1.265625rem,20.25px)] font-medium text-[#F1E6D2]"
          >
            <span aria-hidden className="text-[min(1rem,16px)] leading-none">
              +
            </span>
            {t("새 대화", "New chat")}
          </button>

          <div className="flex flex-col gap-[min(0.5rem,8px)] pt-[min(1rem,16px)]">
            {sessions.map((session) => {
              const current = session.sessionId === currentSessionId;
              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => onSelect(session.sessionId)}
                  aria-current={current}
                  className={`flex w-full items-center gap-[min(0.75rem,12px)] rounded-[min(0.5rem,8px)] border px-[min(0.875rem,14px)] py-[min(0.75rem,12px)] text-left ${
                    current ? "border-[#E07A5F] bg-[rgba(224,122,95,0.06)]" : "border-[rgba(43,33,24,0.05)] bg-white"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-[min(0.84375rem,13.5px)] leading-[min(1.265625rem,20.25px)] font-medium text-[#2B2118]">
                    {session.title || t("제목 없는 대화", "Untitled chat")}
                  </span>
                  <span className="shrink-0 text-[min(0.6875rem,11px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.45)]">
                    {formatDate(session.updatedAt, language)}
                  </span>
                </button>
              );
            })}
          </div>

          {status === "done" && sessions.length === 0 && (
            <p className="py-[min(1.5rem,24px)] text-center text-[min(0.8125rem,13px)] text-[rgba(43,33,24,0.4)]">
              {t("지난 대화가 없어요.", "No past chats yet.")}
            </p>
          )}
          {status === "failed" && (
            <p className="py-[min(1.5rem,24px)] text-center text-[min(0.8125rem,13px)] text-[rgba(43,33,24,0.45)]">
              {t("지난 대화를 불러오지 못했어요.", "Couldn't load past chats.")}
            </p>
          )}
          {/* 다음 페이지를 부르는 기준점 */}
          {hasMore && status === "done" && <div ref={sentinelRef} className="h-px" />}
        </div>
      </div>
    </div>
  );
}
