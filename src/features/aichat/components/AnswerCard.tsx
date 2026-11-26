import type { ReactNode } from "react";
import { sendAiFeedback } from "../../../api/aichat/feedback";
import { hasSentFeedback } from "../../../api/feedbackSent";
import type { AiAnswer } from "../../../api/aichat/types";
import aiOrange from "../../../assets/all/ai-orange.svg";
import ban from "../../../assets/aichat/ban.svg";
import ck from "../../../assets/aichat/ck.svg";
import doubleCk from "../../../assets/aichat/double-ck.svg";
import look from "../../../assets/aichat/look.svg";
import translation from "../../../assets/aichat/translation.svg";
import x from "../../../assets/aichat/x.svg";
import Feedback from "../../../components/Feedback";
import PhraseBookmarkButton from "../../../components/PhraseBookmarkButton";
import { useT } from "../../../contexts/language";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

type Icon = { src: string; w: number; h: number };

// 서버에서 받은 AI 답변을 보여주는 카드
export default function AnswerCard({ answer }: { answer: AiAnswer }) {
  const t = useT();
  return (
    <div className="flex">
      <div className="max-w-[95%] rounded-[min(0.875rem,14px)] border border-[rgba(43,33,24,0.07)] bg-white p-[min(1.0625rem,17px)]">
        <div className="flex items-start gap-[min(0.75rem,12px)]">
          <span className="flex size-[min(2.25rem,36px)] shrink-0 items-center justify-center rounded-full bg-[#F1E6D2]">
            <img src={aiOrange} alt="" style={{ width: size(15), height: size(14) }} />
          </span>
          <p className="pt-[min(0.25rem,4px)] text-[min(0.875rem,14px)] leading-[min(1.421875rem,22.75px)] text-[#2B2118]">
            {answer.summary}
          </p>
        </div>

        <Section
          className="pt-[min(1rem,16px)]"
          icon={{ src: doubleCk, w: 12, h: 11 }}
          label={t("해야 할 행동", "What you should do")}
          labelClassName="text-[#A9BBA0]"
          sub={t("What you should do", "해야 할 행동")}
        >
          <BulletList items={answer.doList} icon={{ src: ck, w: 10, h: 7 }} />
        </Section>

        <Section
          className="pt-[min(0.875rem,14px)]"
          icon={{ src: ban, w: 12, h: 11 }}
          label={t("피해야 할 행동", "What to avoid")}
          labelClassName="text-[#E07A5F]"
          sub={t("What to avoid", "피해야 할 행동")}
        >
          <BulletList items={answer.avoidList} icon={{ src: x, w: 7, h: 7 }} />
        </Section>

        <div className="pt-[min(0.875rem,14px)]">
          <div className="rounded-[min(0.75rem,12px)] border border-[rgba(224,122,95,0.15)] bg-[rgba(224,122,95,0.06)] px-[min(0.9375rem,15px)] py-[min(0.8125rem,13px)]">
            <SectionTitle
              icon={{ src: look, w: 12, h: 11 }}
              label={t("현장에서 확인하세요", "What to look for")}
              labelClassName="text-[rgba(224,122,95,0.8)]"
              sub={t("What to look for", "현장에서 확인하세요")}
            />
            <p className="pt-[min(0.25rem,4px)] text-[min(0.8125rem,13px)] leading-[min(1.3203rem,21.125px)] text-[rgba(43,33,24,0.75)]">
              {answer.lookFor}
            </p>
          </div>
        </div>

        <div className="pt-[min(0.875rem,14px)]">
          <div className="rounded-[min(0.75rem,12px)] border border-[rgba(43,33,24,0.1)] px-[min(0.9375rem,15px)] py-[min(0.8125rem,13px)]">
            <div className="flex items-start justify-between gap-[min(0.5rem,8px)]">
              <SectionTitle
                icon={{ src: translation, w: 12, h: 11 }}
                label={t("유용한 한국어 표현", "Useful Korean phrase")}
                labelClassName="text-[rgba(43,33,24,0.45)]"
                sub={t("Useful Korean phrase", "유용한 한국어 표현")}
              />
              {/* 오프라인 표현 보관함에 저장 */}
              <PhraseBookmarkButton phrase={answer.phrase} />
            </div>
            <p className="pt-[min(0.375rem,6px)] text-[min(1rem,16px)] leading-[min(1.5rem,24px)] text-[#2B2118]">
              {answer.phrase.korean}
            </p>
            <p className="text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[rgba(43,33,24,0.7)]">
              {answer.phrase.english}
            </p>
            <p className="text-[min(0.71875rem,11.5px)] leading-[min(1.078rem,17.25px)] text-[rgba(43,33,24,0.45)] italic">
              {answer.phrase.romanization}
            </p>
          </div>
        </div>

        <Feedback
          onSend={(result) => sendAiFeedback(Number(answer.id), result)}
          alreadySent={hasSentFeedback("ai", Number(answer.id))}
        />
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  label,
  labelClassName,
  sub,
}: {
  icon: Icon;
  label: string;
  labelClassName: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-[min(0.375rem,6px)] text-[min(0.6875rem,11px)] leading-[min(1.03125rem,16.5px)] tracking-[0.05em]">
      <img src={icon.src} alt="" style={{ width: size(icon.w), height: size(icon.h) }} />
      <span className={labelClassName}>{label}</span>
      <span className="text-[rgba(43,33,24,0.35)]">· {sub}</span>
    </div>
  );
}

function Section({
  className,
  children,
  ...title
}: {
  className: string;
  icon: Icon;
  label: string;
  labelClassName: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <SectionTitle {...title} />
      <div className="pt-[min(0.5rem,8px)]">{children}</div>
    </div>
  );
}

function BulletList({ items, icon }: { items: string[]; icon: Icon }) {
  return (
    <ul className="flex flex-col gap-[min(0.375rem,6px)]">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-[min(0.5rem,8px)]">
          {/* 아이콘을 첫 줄 글자 높이 가운데에 맞춘다. */}
          <span className="flex h-[min(1.117rem,17.875px)] w-[min(0.8467rem,13.547px)] shrink-0 items-center justify-center">
            <img src={icon.src} alt="" style={{ width: size(icon.w), height: size(icon.h) }} />
          </span>
          <span className="text-[min(0.8125rem,13px)] leading-[min(1.117rem,17.875px)] text-[rgba(43,33,24,0.75)]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
