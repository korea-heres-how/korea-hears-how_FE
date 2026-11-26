import { apiRequest, toServerUrl } from "../client";
import type { MyProfileResponse, Profile, ProfileImageResponse, UpdateMeBody } from "./types";

// 서버 응답을 화면에서 쓰는 Profile로 바꾼다.
function toProfile(data: MyProfileResponse): Profile {
  return {
    name: data.name,
    email: data.email,
    // 상대경로면 서버 주소를 붙여서 화면에 띄울 수 있게 한다.
    imageUrl: data.profileImageUrl ? toServerUrl(data.profileImageUrl) : undefined,
  };
}

// GET /api/users/me
// 토큰으로 본인을 알아내므로 사용자 ID는 보내지 않는다.
export async function getMe(): Promise<Profile> {
  return toProfile(await apiRequest<MyProfileResponse>("/api/users/me"));
}

// PATCH /api/users/me { name?, appLanguage? }
// 이름·앱 언어를 부분 수정하고, 수정된 내 정보를 돌려받는다. 사진은 아래 uploadProfileImage로 따로 올린다.
export async function updateMe(body: UpdateMeBody): Promise<Profile> {
  return toProfile(await apiRequest<MyProfileResponse>("/api/users/me", { method: "PATCH", body }));
}

// POST /api/users/me/profile-image (multipart: file)
// 프로필 사진을 바꾸고, 화면에 띄울 사진 주소를 돌려준다. JPG/PNG 최대 2MiB, 한 변 2048px·총 400만 픽셀 이하.
export async function uploadProfileImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const data = await apiRequest<ProfileImageResponse>("/api/users/me/profile-image", { method: "POST", body });
  return toServerUrl(data.profileImageUrl);
}

// DELETE /api/users/me/profile-image
// 프로필 사진을 지운다(서버 값이 null이 됨). 사진이 원래 없어도 성공한다.
export async function deleteProfileImage(): Promise<void> {
  await apiRequest<null>("/api/users/me/profile-image", { method: "DELETE" });
}

// DELETE /api/users/me (본문 없음)
// 회원 탈퇴. 탈퇴하면 그 계정의 모든 토큰이 서버에서 거부되고, 같은 이메일로 다시 가입할 수 없다.
// 탈퇴 뒤에는 서버에 로그아웃을 보내지 않고 앱에서만 로그인 정보를 지운다. (AuthProvider의 logout)
export async function deleteAccount(): Promise<void> {
  await apiRequest<null>("/api/users/me", { method: "DELETE" });
}
