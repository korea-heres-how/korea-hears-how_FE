import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { LoginFailedError } from "../../api/auth/login";
import { useAuth } from "../../contexts/auth";
import { useT } from "../../contexts/language";
import AuthLayout from "./components/AuthLayout";
import EmailStep from "./components/EmailStep";
import ErrorToast from "../../components/ErrorToast";
import PasswordStep from "./components/PasswordStep";

// 로그인: 같은 /login 주소 안에서 이메일 → 비밀번호 단계로 화면만 바뀐다.
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useT();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  // 팝업 종류만 저장해서, 언어를 바꾸면 문구도 같이 바뀌게 한다.
  const [toast, setToast] = useState<"" | "wrong" | "failed">("");
  const closeToast = useCallback(() => setToast(""), []);
  const toastMessage =
    toast === "wrong"
      ? t("아이디나 비밀번호가 틀렸습니다", "Incorrect email or password.")
      : t(
          "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.",
          "Couldn't log in. Please try again in a moment.",
        );

  const handleLogin = async (password: string) => {
    try {
      await login(email, password);
      navigate("/map", { replace: true });
    } catch (e) {
      setToast(e instanceof LoginFailedError ? "wrong" : "failed");
      throw e;
    }
  };

  return (
    <AuthLayout>
      {toast && <ErrorToast message={toastMessage} onClose={closeToast} />}
      {step === "email" ? (
        <EmailStep
          initialEmail={email}
          onNext={(value) => {
            setEmail(value);
            setStep("password");
          }}
        />
      ) : (
        <PasswordStep email={email} onBack={() => setStep("email")} onLogin={handleLogin} />
      )}
    </AuthLayout>
  );
}
