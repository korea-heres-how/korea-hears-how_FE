import { type ChangeEvent, useRef } from "react";
import camera from "../../../assets/auth/camera.svg";
import { useT } from "../../../contexts/language";
import { primaryButtonClassName, stepSubtitleClassName, stepTitleClassName } from "./authStyles";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

const smallButtonClassName =
  "flex h-[min(2.046875rem,32.75px)] items-center justify-center rounded-[min(0.5rem,8px)] border border-[rgba(43,33,24,0.15)] bg-white px-[min(0.8125rem,13px)] text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[#2B2118]";

// 고른 사진 파일과 미리보기 주소
export type ProfilePhoto = { file: File; url: string };

// 서버가 받는 프로필 사진 조건: JPG/PNG, 최대 2MiB, 한 변 2048px 이하, 총 400만 픽셀 이하
const PHOTO_TYPES = ["image/jpeg", "image/png"];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_SIDE = 2048;
const MAX_PHOTO_PIXELS = 4_000_000;

// 미리보기 주소로 사진 크기를 읽어 서버 조건에 맞는지 본다. (읽지 못하면 깨진 파일로 본다)
function fitsPhotoSize(url: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve(
        img.naturalWidth <= MAX_PHOTO_SIDE &&
          img.naturalHeight <= MAX_PHOTO_SIDE &&
          img.naturalWidth * img.naturalHeight <= MAX_PHOTO_PIXELS,
      );
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

type ProfileStepProps = {
  name: string;
  // 고른 사진은 앞 단계로 갔다 와도 남도록 SignupPage가 들고 있다.
  photo: ProfilePhoto | null;
  onPhotoChange: (photo: ProfilePhoto | null) => void;
  // 조건(JPG/PNG, 2MB, 2048px)에 맞지 않는 사진을 골랐을 때 (안내는 SignupPage가 팝업으로)
  onInvalidPhoto: () => void;
  // 다음 단계(언어 선택)로. 사진 업로드와 가입 요청은 언어를 고른 뒤 한꺼번에 한다.
  onNext: () => void;
};

// 회원가입 5단계: 프로필 사진 고르기 (사진이 없으면 이름 첫 글자를 보여준다)
export default function ProfileStep({ name, photo, onPhotoChange, onInvalidPhoto, onNext }: ProfileStepProps) {
  const t = useT();
  const photoInput = useRef<HTMLInputElement>(null);

  // 사진을 바꾸면 이전 미리보기 주소는 해제한다.
  const changePhoto = (next: ProfilePhoto | null) => {
    if (photo) URL.revokeObjectURL(photo.url);
    onPhotoChange(next);
  };

  const choosePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) return onInvalidPhoto();
    const url = URL.createObjectURL(file);
    if (!(await fitsPhotoSize(url))) {
      URL.revokeObjectURL(url);
      return onInvalidPhoto();
    }
    changePhoto({ file, url });
  };

  const openPicker = () => photoInput.current?.click();

  return (
    <div>
      {/* 큰 제목은 고른 언어, 작은 부제는 다른 언어 */}
      <h1 className={stepTitleClassName}>{t("프로필을 설정해주세요", "Set up your profile")}</h1>
      <p className={stepSubtitleClassName}>{t("Set up your profile", "프로필을 설정해주세요")}</p>

      <div className="flex flex-col items-center pt-[min(1.75rem,28px)]">
        <div className="relative">
          <span className="flex size-[min(6rem,96px)] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#E07A5F] text-[min(2.125rem,34px)] leading-[min(3.1875rem,51px)] font-semibold text-[#F1E6D2]">
            {photo ? <img src={photo.url} alt="" className="size-full object-cover" /> : name.charAt(0)}
          </span>
          <button
            type="button"
            onClick={openPicker}
            aria-label={t("사진 업로드", "Upload photo")}
            className="absolute top-[min(4.25rem,68px)] left-[min(4.25rem,68px)] flex size-[min(2rem,32px)] items-center justify-center rounded-full bg-[#2B2118]"
          >
            <img src={camera} alt="" style={{ width: size(16), height: size(15) }} />
          </button>
        </div>
        <input ref={photoInput} type="file" accept="image/jpeg,image/png" onChange={choosePhoto} className="hidden" />

        <div className="flex gap-[min(0.5rem,8px)] pt-[min(1rem,16px)]">
          <button type="button" onClick={openPicker} className={smallButtonClassName}>
            {t("사진 업로드", "Upload photo")}
          </button>
          <button type="button" onClick={() => changePhoto(null)} className={smallButtonClassName}>
            {t("기본 이미지 사용", "Use default image")}
          </button>
        </div>

        <div className="w-full pt-[min(1.5rem,24px)]">
          <div className="rounded-[min(0.875rem,14px)] border border-[rgba(43,33,24,0.1)] bg-[rgba(255,255,255,0.75)] px-[min(1.0625rem,17px)] py-[min(0.8125rem,13px)] text-center">
            <p className="text-[min(0.6875rem,11px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.5)]">
              {t("이름 · Name", "Name")}
            </p>
            <p className="truncate text-[min(0.9375rem,15px)] leading-[min(1.40625rem,22.5px)] font-medium text-[#2B2118]">
              {name}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-[min(1.75rem,28px)]">
        <button type="button" onClick={onNext} className={primaryButtonClassName}>
          {t("다음", "Next")}
        </button>
      </div>
    </div>
  );
}
