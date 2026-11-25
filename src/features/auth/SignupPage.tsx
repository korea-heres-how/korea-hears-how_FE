import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { InvalidCodeError } from "../../api/auth";
import {
  SignupFailedError,
  sendSignupCode,
  signup,
  uploadSignupProfileImage,
  verifySignupCode,
} from "../../api/auth/signup";
import done from "../../assets/auth/done.svg";
import ErrorToast from "../../components/ErrorToast";
import { useLanguage, useT } from "../../contexts/language";
import AuthLayout from "./components/AuthLayout";
import DoneStep from "./components/DoneStep";
import EmailInputStep from "./components/EmailInputStep";
import LanguageStep from "./components/LanguageStep";
import NameStep from "./components/NameStep";
import NewPasswordStep from "./components/NewPasswordStep";
import ProfileStep, { type ProfilePhoto } from "./components/ProfileStep";
import StepProgress from "./components/StepProgress";
import VerifyCodeStep from "./components/VerifyCodeStep";

type Step = "email" | "code" | "password" | "name" | "profile" | "language" | "done";

// 단계 표시줄에 나오는 단계 (완료 화면에는 표시줄이 없다)
const PROGRESS_STEPS = ["email", "code", "password", "name", "profile", "language"] as const;

type Toast = "" | "send" | "verify" | "signup" | "taken" | "tokenExpired" | "photo";

// 회원가입: 같은 /signup 주소 안에서 이메일 → 인증번호 → 비밀번호 → 이름 → 프로필 → 언어 선택 → 완료 순으로 화면만 바뀐다.
// 언어 단계에서 "다음"을 누르면 (사진이 있으면 사진 업로드 →) 가입 요청을 보낸다. (가입 요청에 앱 언어가 필요해서)
// 앞 단계로 돌아가도 입력한 값은 남아 있고, 가입을 마치면 로그인 화면으로 보낸다.
export default function SignupPage() {
  const navigate = useNavigate();
  const t = useT();
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<ProfilePhoto | null>(null);
  // 인증번호 확인 후 받은 일회용 가입 토큰. 서버 안내대로 화면 상태에만 두고 저장하지 않는다.
  const [signupToken, setSignupToken] = useState("");
  // 이미 올린 사진과 그 주소. 가입 요청만 실패해서 다시 누를 때 같은 사진을 또 올리지 않는다.
  const [uploaded, setUploaded] = useState<{ file: File; url: string } | null>(null);
  // 팝업 종류만 저장해서, 언어를 바꾸면 문구도 같이 바뀌게 한다.
  const [toast, setToast] = useState<Toast>("");
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
    signup: t(
      "가입하지 못했어요. 잠시 후 다시 시도해 주세요.",
      "Couldn't create your account. Please try again in a moment.",
    ),
    taken: t("이미 가입된 이메일이에요. 로그인해 주세요.", "This email is already registered. Please log in."),
    tokenExpired: t(
      "인증 시간이 지났어요. 이메일 인증을 다시 해주세요.",
      "Your verification has expired. Please verify your email again.",
    ),
    photo: t(
      "JPG·PNG, 2MB·2048px 이하 사진만 올릴 수 있어요.",
      "Please use a JPG or PNG under 2MB and 2048px.",
    ),
  }[toast];

  // 서버 요청이 실패하면 위쪽 팝업으로 알리고, 단계 화면이 로딩을 풀 수 있게 오류를 다시 던진다.
  // 화면 안에 오류 문구로 보여주는 경우(인증번호 틀림·만료)는 팝업을 띄우지 않는다.
  const request = async (action: () => Promise<void>, fail: "send" | "verify" | "signup") => {
    try {
      await action();
    } catch (e) {
      if (e instanceof SignupFailedError) {
        if (e.reason === "taken") setToast("taken");
        else if (e.reason === "photo") setToast("photo");
        else if (e.reason === "tokenExpired") {
          // 가입 토큰(10분)이 끝났으면 이메일 인증부터 다시 한다. 입력한 값은 그대로 남는다.
          setToast("tokenExpired");
          setSignupToken("");
          setUploaded(null);
          setStep("email");
        } else setToast(fail);
      } else if (!(e instanceof InvalidCodeError)) {
        setToast(fail);
      }
      throw e;
    }
  };

  // 사진이 있으면 먼저 올리고(이미 올린 같은 사진이면 건너뜀), 그 주소와 함께 가입 요청을 보낸다.
  const submitSignup = async () => {
    let profileImageUrl: string | undefined;
    if (photo) {
      profileImageUrl =
        uploaded?.file === photo.file
          ? uploaded.url
          : await uploadSignupProfileImage(email, signupToken, photo.file);
      setUploaded({ file: photo.file, url: profileImageUrl });
    }
    await signup({
      email,
      password,
      name,
      appLanguage: language === "en" ? "EN" : "KO",
      signupToken,
      profileImageUrl,
    });
    setStep("done");
  };

  const progressIndex = PROGRESS_STEPS.findIndex((item) => item === step);

  const handleBack = () => {
    if (progressIndex === 0) navigate("/login");
    else setStep(PROGRESS_STEPS[progressIndex - 1]);
  };

  return (
    <AuthLayout
      top={
        progressIndex >= 0 && (
          <StepProgress step={progressIndex + 1} total={PROGRESS_STEPS.length} onBack={handleBack} />
        )
      }
    >
      {toast && <ErrorToast message={toastMessage} onClose={closeToast} />}
      {step === "email" && (
        <EmailInputStep
          title={t("계정을 만들어볼까요?", "Create your account")}
          subtitle={t("Create your account", "계정을 만들어볼까요?")}
          description={t(
            "이메일을 입력하고 회원가입을 시작하세요.",
            "Enter your email to start signing up.",
          )}
          submitLabel={t("다음", "Next")}
          loginPrompt={t("이미 계정이 있으신가요?", "Already have an account?")}
          initialEmail={email}
          onNext={(value) =>
            request(async () => {
              await sendSignupCode(value);
              // 이메일을 바꿔 다시 인증하면 예전 토큰·사진은 쓸 수 없다.
              if (value !== email) {
                setSignupToken("");
                setUploaded(null);
              }
              setEmail(value);
              setStep("code");
            }, "send")
          }
        />
      )}
      {step === "code" && (
        <VerifyCodeStep
          email={email}
          description={t("입력하신 이메일로 인증번호를 보냈어요.", "We sent a code to your email.")}
          onVerify={(value) =>
            request(async () => {
              const result = await verifySignupCode(email, value);
              // 예전에 가입만 하고 인증을 안 한 계정이면 인증만 끝나고 토큰이 없다 → 바로 완료(로그인)로.
              if (!result) return setStep("done");
              setSignupToken(result.signupToken);
              setStep("password");
            }, "verify")
          }
          onResend={() => request(() => sendSignupCode(email), "send")}
        />
      )}
      {step === "password" && (
        <NewPasswordStep
          title={t("비밀번호를 설정해주세요", "Create a password")}
          subtitle={t("Create a password", "비밀번호를 설정해주세요")}
          passwordLabel={t("비밀번호 · Password", "Password")}
          confirmLabel={t("비밀번호 확인 · Confirm password", "Confirm password")}
          submitLabel={t("다음", "Next")}
          initialPassword={password}
          onSubmit={async (value) => {
            setPassword(value);
            setStep("name");
          }}
        />
      )}
      {step === "name" && (
        <NameStep
          initialName={name}
          onNext={(value) => {
            setName(value);
            setStep("profile");
          }}
        />
      )}
      {step === "profile" && (
        <ProfileStep
          name={name}
          photo={photo}
          onPhotoChange={setPhoto}
          onInvalidPhoto={() => setToast("photo")}
          onNext={() => setStep("language")}
        />
      )}
      {step === "language" && <LanguageStep onNext={() => request(submitSignup, "signup")} />}
      {step === "done" && (
        <DoneStep
          icon={done}
          title={t("가입이 완료되었어요", "You're all set!")}
          subtitle={t("You're all set!", "가입이 완료되었어요")}
          description={t(
            "이제 한국에서 필요한 가이드를 바로 확인할 수 있어요.",
            "You can now check the guides you need in Korea.",
          )}
          buttonLabel={t("계속하기", "Continue")}
          onDone={() => navigate("/login", { replace: true })}
        />
      )}
    </AuthLayout>
  );
}
