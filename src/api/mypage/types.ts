// 마이페이지 프로필에서 쓰는 내 정보
export type Profile = {
  name: string;
  email: string; // 로그인 아이디라서 프로필 수정에서는 바꿀 수 없다.
  imageUrl?: string; // 프로필 사진. 서버에는 아직 사진 필드가 없어서 비어 있으면 주황 칸에 사람 아이콘
};

// 서버 응답 data (MyProfileResponse) 중 화면에서 쓰는 필드만 적어둔다.
// displayName은 서버에서 빼고 name만 내려주도록 바뀔 예정이라 쓰지 않는다.
export type MyProfileResponse = {
  userId: number;
  email: string;
  name: string;
};
