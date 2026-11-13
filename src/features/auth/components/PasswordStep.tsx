import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import back from "../../../assets/aichat/back.svg";
import eyeOff from "../../../assets/auth/eye-off.svg";
import eye from "../../../assets/auth/eye.svg";
import id from "../../../assets/auth/id.svg";
import { useT } from "../../../contexts/language";
import AuthField from "./AuthField";
import {
  inputClassName,
  primaryButtonClassName,
  subtitleClassName,
  titleClassName,
} from "./authStyles";
import SignupLink from "./SignupLink";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

type PasswordStepProps = {
  email: string;
  onBack: () => void;
  // 로그인 시도. 실패하면 오류를 던진다.
  onLogin: (password: string) => Promise<void>;
};

// 로그인 2단계: 비밀번호 입력
export default function PasswordStep({
  email,
  onBack,
  onLogin,
}: PasswordStepProps) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  // 오류 여부만 저장해서, 언어를 바꾸면 오류 문구도 같이 바뀌게 한다.
  const [error, setError] = useState(false);
  const errorMessage = error ? t("비밀번호를 입력해주세요.", "Please enter your password.") : "";
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError(true);
    setLoading(true);
    try {
      await onLogin(password);
    } catch {
      // 틀렸다는 안내는 LoginPage가 위쪽 팝업으로 보여준다.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-[min(0.25rem,4px)] text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] font-medium text-[rgba(43,33,24,0.8)]"
      >
        <img src={back} alt="" style={{ width: size(16), height: size(15) }} />
        {t("이메일 다시 입력", "Change email")}
      </button>

      <h1 className={`pt-[min(1.25rem,20px)] ${titleClassName}`}>
        {t("비밀번호를 입력해주세요", "Enter your password")}
      </h1>
      <p className={subtitleClassName}>{t("Enter your password", "비밀번호를 입력해주세요")}</p>

      <div className="pt-[min(1rem,16px)]">
        <span className="inline-flex h-[min(2.1875rem,35px)] max-w-full items-center gap-[min(0.5rem,8px)] rounded-full border border-[rgba(43,33,24,0.15)] bg-white px-[min(0.9375rem,15px)]">
          <img src={id} alt="" style={{ width: size(15), height: size(14) }} />
          <span className="truncate text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] font-medium text-[rgba(43,33,24,0.9)]">
            {email}
          </span>
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="pt-[min(1.25rem,20px)]"
      >
        <AuthField label={t("비밀번호 · Password", "Password")} error={errorMessage}>
          <input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            autoFocus
            aria-invalid={error}
            className={`${inputClassName(error)} pr-[min(2.8125rem,45px)]`}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
            aria-pressed={visible}
            className="absolute right-[min(0.5rem,8px)] bottom-[min(0.3125rem,5px)] flex size-[min(2rem,32px)] items-center justify-center"
          >
            {/* 지금 상태를 보여준다: 보이는 중이면 eye, 숨김이면 eye-off (eye-off는 여백 포함 30px 아이콘) */}
            {visible ? (
              <img src={eye} alt="" style={{ width: size(18), height: size(17) }} />
            ) : (
              <img src={eyeOff} alt="" style={{ width: size(30), height: size(30) }} />
            )}
          </button>
        </AuthField>
        <div className="pt-[min(1rem,16px)]">
          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClassName}
          >
            {t("로그인", "Log in")}
          </button>
        </div>
      </form>

      <div className="flex justify-center pt-[min(1rem,16px)]">
        <Link
          to="/find-password"
          className="text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] font-medium text-[rgba(43,33,24,0.8)] underline"
        >
          {t("비밀번호를 잊으셨나요?", "Forgot your password?")}
        </Link>
      </div>

      <SignupLink />
    </div>
  );
}
