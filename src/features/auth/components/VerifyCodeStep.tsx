import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { InvalidCodeError } from "../../../api/auth";
import findPwd from "../../../assets/auth/find-pwd.svg";
import notice from "../../../assets/auth/notice.svg";
import timer from "../../../assets/auth/timer.svg";
import { useT } from "../../../contexts/language";
import AuthField from "./AuthField";
import {
  descriptionClassName,
  inputClassName,
  primaryButtonClassName,
  stepSubtitleClassName,
  stepTitleClassName,
} from "./authStyles";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 인증번호 유효 시간 (3분)
const CODE_TTL_SECONDS = 180;

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

type VerifyCodeStepProps = {
  email: string;
  // 제목 아래 안내 문장 (비밀번호 찾기 / 회원가입마다 다르다)
  description: ReactNode;
  // 인증번호 확인. 틀리거나 만료되면 InvalidCodeError(reason)를 던진다.
  onVerify: (code: string) => Promise<void>;
  // 인증번호 다시 보내기. 실패하면 오류를 던진다.
  onResend: () => Promise<void>;
};

// 비밀번호 찾기 / 회원가입 2단계: 이메일로 받은 인증번호 입력
export default function VerifyCodeStep({
  email,
  description,
  onVerify,
  onResend,
}: VerifyCodeStepProps) {
  const t = useT();
  const [code, setCode] = useState("");
  // 오류 종류만 저장해서, 언어를 바꾸면 오류 문구도 같이 바뀌게 한다.
  const [error, setError] = useState<"" | "expired" | "short" | "wrong" | "tooMany">("");
  const errorMessage = {
    "": "",
    expired: t(
      "인증 시간이 만료되었어요. 인증번호를 다시 보내주세요.",
      "The code has expired. Please request a new one.",
    ),
    short: t("인증번호 6자리를 입력해주세요.", "Please enter the 6-digit code."),
    wrong: t(
      "인증번호가 올바르지 않아요. 다시 확인해주세요.",
      "That code isn't correct. Please check it again.",
    ),
    tooMany: t(
      "입력 횟수를 넘었어요. 인증번호를 다시 보내주세요.",
      "Too many attempts. Please request a new code.",
    ),
  }[error];
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(CODE_TTL_SECONDS);
  const expired = remaining <= 0;

  useEffect(() => {
    if (expired) return;
    const id = setTimeout(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, expired]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (expired) return setError("expired");
    // 서버는 숫자 6자리만 받는다.
    if (code.length < 6) return setError("short");
    setLoading(true);
    try {
      await onVerify(code);
    } catch (e) {
      // 그 밖의 실패 안내는 FindPasswordPage가 위쪽 팝업으로 보여준다.
      if (e instanceof InvalidCodeError) setError(e.reason);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setRemaining(CODE_TTL_SECONDS);
      setCode("");
      setError("");
    } catch {
      // 실패 안내는 FindPasswordPage가 위쪽 팝업으로 보여준다.
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex size-[min(3.5rem,56px)] items-center justify-center rounded-full bg-[#E07A5F]">
        <img src={findPwd} alt="" style={{ width: size(28), height: size(26) }} />
      </div>
      {/* 큰 제목은 고른 언어, 작은 부제는 다른 언어 */}
      <h1 className={`pt-[min(1.25rem,20px)] ${stepTitleClassName}`}>
        {t("이메일을 확인해주세요", "Verify your email")}
      </h1>
      <p className={stepSubtitleClassName}>{t("Verify your email", "이메일을 확인해주세요")}</p>
      <p className={`pt-[min(0.75rem,12px)] ${descriptionClassName}`}>{description}</p>

      <div className="pt-[min(1rem,16px)]">
        <p className="flex h-[min(2.59375rem,41.5px)] items-center justify-center rounded-[min(0.5rem,8px)] border border-[rgba(43,33,24,0.15)] bg-[rgba(255,255,255,0.85)] px-[min(1.0625rem,17px)] text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-medium text-[rgba(43,33,24,0.9)]">
          <span className="truncate">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="pt-[min(1rem,16px)] text-left">
        <AuthField
          label={t("인증번호 · Verification code", "Verification code")}
          error={errorMessage}
          aside={
            // 시간이 다 되면 빨간 칩으로 바뀐다.
            <span
              className={`flex h-[min(1.5625rem,25px)] items-center gap-[min(0.25rem,4px)] rounded-full px-[min(0.625rem,10px)] ${
                expired ? "bg-[rgba(180,69,58,0.15)]" : "bg-[rgba(78,145,121,0.15)]"
              }`}
            >
              {expired ? (
                <img src={notice} alt="" style={{ width: size(14), height: size(13) }} />
              ) : (
                <img src={timer} alt="" style={{ width: size(15), height: size(14) }} />
              )}
              <span
                className={`text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-bold ${
                  expired ? "text-[#B4453A]" : "text-[#4E9179]"
                }`}
              >
                {formatTime(remaining)}
              </span>
            </span>
          }
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              if (error) setError("");
            }}
            placeholder="123456"
            autoComplete="one-time-code"
            aria-invalid={!!error}
            className={`${inputClassName(!!error)} text-center tracking-[0.35em]`}
          />
        </AuthField>
        <div className="pt-[min(0.75rem,12px)]">
          <button type="submit" disabled={loading} className={primaryButtonClassName}>
            {t("인증하기", "Verify")}
          </button>
        </div>
        <div className="flex justify-center pt-[min(0.75rem,12px)]">
          <button
            type="button"
            onClick={handleResend}
            className="text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] font-medium text-[rgba(43,33,24,0.75)] underline"
          >
            {t("인증번호 다시 보내기", "Resend code")}
          </button>
        </div>
      </form>
    </div>
  );
}
