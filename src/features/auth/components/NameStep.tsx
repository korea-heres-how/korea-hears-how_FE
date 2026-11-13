import { type FormEvent, useState } from "react";
import { useT } from "../../../contexts/language";
import AuthField from "./AuthField";
import {
  descriptionClassName,
  inputClassName,
  primaryButtonClassName,
  stepSubtitleClassName,
  stepTitleClassName,
} from "./authStyles";

const NAME_MAX_LENGTH = 20;

type NameStepProps = {
  // 다음 단계에서 뒤로 오면 입력했던 이름을 그대로 보여준다.
  initialName: string;
  onNext: (name: string) => void;
};

// 회원가입 4단계: 서비스에서 쓸 이름 입력
export default function NameStep({ initialName, onNext }: NameStepProps) {
  const t = useT();
  const [name, setName] = useState(initialName);
  // 오류 여부만 저장해서, 언어를 바꾸면 오류 문구도 같이 바뀌게 한다.
  const [error, setError] = useState(false);
  const errorMessage = error ? t("이름을 입력해주세요.", "Please enter your name.") : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return setError(true);
    onNext(value);
  };

  return (
    <div>
      {/* 큰 제목은 고른 언어, 작은 부제는 다른 언어 */}
      <h1 className={stepTitleClassName}>{t("어떻게 불러드리면 될까요?", "What should we call you?")}</h1>
      <p className={stepSubtitleClassName}>{t("What should we call you?", "어떻게 불러드리면 될까요?")}</p>
      <p className={`pt-[min(0.75rem,12px)] ${descriptionClassName}`}>
        {t("서비스에서 사용할 이름이에요.", "This is the name you'll use in the app.")}
      </p>

      <form onSubmit={handleSubmit} noValidate className="pt-[min(1.5rem,24px)]">
        <AuthField label={t("이름 · Name", "Name")} error={errorMessage}>
          <input
            type="text"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(false);
            }}
            placeholder={t("예: 지우", "e.g. Jiwoo")}
            autoComplete="nickname"
            aria-invalid={error}
            className={inputClassName(error)}
          />
        </AuthField>
        <div className="pt-[min(1rem,16px)]">
          <button type="submit" className={primaryButtonClassName}>
            {t("다음", "Next")}
          </button>
        </div>
      </form>
    </div>
  );
}
