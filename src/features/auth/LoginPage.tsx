import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { type LoginFailReason, LoginFailedError } from "../../api/auth/login";
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
  const [toast, setToast] = useState<"" | LoginFailReason>("");
  const closeToast = useCallback(() => setToast(""), []);
  const toastMessages: Record<LoginFailReason, string> = {
    wrong: t("아이디나 비밀번호가 틀렸습니다", "Incorrect email or password."),
    invalidEmail: t("이메일 형식이 올바르지 않아요", "Please enter a valid email address."),
    unavailable: t("로그인할 수 없는 계정이에요", "This account can't be used to log in."),
    network: t("서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.", "Couldn't reach the server. Check your connection."),
    server: t("로그인하지 못했어요. 잠시 후 다시 시도해 주세요.", "Couldn't log in. Please try again in a moment."),
  };

  const handleLogin = async (password: string) => {
    try {
      await login(email, password);
      navigate("/map", { replace: true });
    } catch (e) {
      setToast(e instanceof LoginFailedError ? e.reason : "server");
      throw e;
    }
  };

  return (
    <AuthLayout>
      {toast && <ErrorToast message={toastMessages[toast]} onClose={closeToast} />}
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
