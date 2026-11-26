import type { AppLanguage } from "../auth/types";

// 마이페이지 프로필에서 쓰는 내 정보
export type Profile = {
  name: string;
  email: string; // 로그인 아이디라서 프로필 수정에서는 바꿀 수 없다.
  imageUrl?: string; // 프로필 사진 (화면에 바로 띄울 수 있는 주소). 없으면 주황 칸에 사람 아이콘
};

// 서버 응답 data (MyProfileResponse) 중 화면에서 쓰는 필드만 적어둔다.
// displayName은 name과 같은 값을 주는 호환용이라 쓰지 않는다.
// (응답에는 loginType, appLanguage, emailVerified도 오지만 아직 쓰는 화면이 없어서 뺐다)
export type MyProfileResponse = {
  userId: number;
  email: string;
  name: string;
  // 새로 올린 사진은 "/api/profile-images/{uuid}.png" 상대경로, 예전 외부 사진은 전체 URL, 없으면 null
  profileImageUrl: string | null;
};

// PATCH /api/users/me 요청 본문. 바꿀 값만 보낸다(생략하면 서버 값 유지). 최소 하나는 있어야 한다.
export type UpdateMeBody = {
  name?: string; // 1~20자, 공백만으로는 안 됨
  appLanguage?: AppLanguage;
};

// POST /api/users/me/profile-image 응답 data
export type ProfileImageResponse = {
  profileImageUrl: string; // "/api/profile-images/{uuid}.png" 상대경로
};
