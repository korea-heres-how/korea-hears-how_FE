import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { InvalidCodeError, resetPassword, sendResetCode, verifyResetCode } from "../../api/auth";
import open from "../../assets/auth/open.svg";
import ErrorToast from "../../components/ErrorToast";
import { useT } from "../../contexts/language";
import AuthLayout from "./components/AuthLayout";
import DoneStep from "./components/DoneStep";
import EmailInputStep from "./components/EmailInputStep";
import NewPasswordStep from "./components/NewPasswordStep";
import StepProgress from "./components/StepProgress";
import VerifyCodeStep from "./components/VerifyCodeStep";

type Step = "email" | "code" | "password" | "done";

const STEP_NUMBER = { email: 1, code: 2, password: 3 } as const;

// 비밀번호 찾기: 같은 /find-password 주소 안에서 이메일 → 인증번호 → 새 비밀번호 → 완료 순으로 화면만 바뀐다.
export default function FindPasswordPage() {
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // 팝업 종류만 저장해서, 언어를 바꾸면 문구도 같이 바뀌게 한다.
  const [toast, setToast] = useState<"" | "send" | "verify" | "reset">("");
  const closeToast = useCallback(() => setToast(""), []);
  const toastMessage = {
    "": "",
    send: t(
      "인증번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
      "Couldn't send the code. Please try again in a moment.",
    ),
    verify: t(
      "인증번호를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
      "Couldn't verify the code. Please try again in a moment.",
    ),
    reset: t(
      "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.",
      "Couldn't change your password. Please try again in a moment.",
    ),
  }[toast];

  // 서버 요청이 실패하면 위쪽 팝업으로 알리고, 단계 화면이 로딩을 풀 수 있게 오류를 다시 던진다.
  const request = async (action: () => Promise<void>, fail: "send" | "verify" | "reset") => {
    try {
      await action();
    } catch (e) {
      if (!(e instanceof InvalidCodeError)) setToast(fail);
      throw e;
    }
  };

  const handleBack = () => {
    if (step === "email") navigate("/login");
    else if (step === "code") setStep("email");
    else if (step === "password") setStep("code");
  };

  return (
    <AuthLayout
      top={
        step !== "done" && (
          <StepProgress step={STEP_NUMBER[step]} total={3} onBack={handleBack} />
        )
      }
    >
      {toast && <ErrorToast message={toastMessage} onClose={closeToast} />}
      {step === "email" && (
        <EmailInputStep
          title={t("비밀번호를 다시 설정해볼까요?", "Reset your password")}
          subtitle={t("Reset your password", "비밀번호를 다시 설정해볼까요?")}
          description={t(
            "가입할 때 사용한 이메일을 입력해주세요.",
            "Enter the email you used to sign up.",
          )}
          submitLabel={t("인증번호 보내기", "Send code")}
          loginPrompt={t("비밀번호가 기억나셨나요?", "Remember your password?")}
          initialEmail={email}
          onNext={(value) =>
            request(async () => {
              await sendResetCode(value);
              setEmail(value);
              setStep("code");
            }, "send")
          }
        />
      )}
      {step === "code" && (
        <VerifyCodeStep
          email={email}
          description={t(
            <>
              입력하신 이메일로 인증번호를 보냈어요.
              <br />
              본인 확인 후 비밀번호를 다시 설정할 수 있어요.
            </>,
            "We sent a code to your email. Verify it to reset your password.",
          )}
          onVerify={(value) =>
            request(async () => {
              await verifyResetCode(email, value);
              setCode(value);
              setStep("password");
            }, "verify")
          }
          onResend={() => request(() => sendResetCode(email), "send")}
        />
      )}
      {step === "password" && (
        <NewPasswordStep
          title={t("새 비밀번호를 설정해주세요", "Create a new password")}
          subtitle={t("Create a new password", "새 비밀번호를 설정해주세요")}
          passwordLabel={t("새 비밀번호 · New password", "New password")}
          confirmLabel={t("새 비밀번호 확인 · Confirm password", "Confirm password")}
          submitLabel={t("비밀번호 변경", "Change password")}
          onSubmit={(password) =>
            request(async () => {
              await resetPassword(email, code, password);
              setStep("done");
            }, "reset")
          }
        />
      )}
      {step === "done" && (
        <DoneStep
          icon={open}
          title={t("비밀번호가 변경되었어요", "Password updated")}
          subtitle={t("Password updated", "비밀번호가 변경되었어요")}
          description={t("새 비밀번호로 다시 로그인해주세요.", "Please log in with your new password.")}
          buttonLabel={t("로그인으로 돌아가기", "Back to log in")}
          onDone={() => navigate("/login", { replace: true })}
        />
      )}
    </AuthLayout>
  );
}
