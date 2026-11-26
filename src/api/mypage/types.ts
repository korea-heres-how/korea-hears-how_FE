import type { AppLanguage } from "../auth/types";
import type { PhraseSourceType, ServerPhraseCategory } from "../phrases";

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

// ---- 즐겨찾기 ----
// 즐겨찾기 목록 한 페이지. 서버는 장소 ID만 주므로 이름·분류·사진은 카드가 따로 불러온다.
export type FavoritePage = {
  placeIds: string[]; // 최근 저장순
  total: number; // 전체 즐겨찾기 개수
  hasMore: boolean; // 다음 페이지가 있는지
};

// GET /api/users/me/favorites 응답 data (FavoritePageResponse) 중 쓰는 필드만.
// 항목의 name/imageUrl/address는 서버가 항상 null로 줘서 적지 않는다.
export type FavoritePageResponse = {
  items: { placeId: string; createdAt: string }[];
  page: number;
  totalElements: number;
  totalPages: number;
};

// ---- 저장 표현 (오프라인 표현 보관함) ----
// GET·POST /api/users/me/phrases 응답의 표현 한 개 (SavedPhraseResponse) 중 쓰는 필드만.
// (placeId, placeName, audioUrl, savedAt도 오지만 아직 쓰는 화면이 없어서 뺐다)
export type SavedPhraseResponse = {
  savedPhraseId: number;
  sourceType: PhraseSourceType;
  sourceId: number;
  phraseIndex: number | null;
  category: ServerPhraseCategory | null;
  korean: string;
  romanization: string;
  english: string;
};

// GET /api/users/me/phrases 응답 data (SavedPhrasePage) 중 쓰는 필드만
export type SavedPhrasePage = {
  items: SavedPhraseResponse[];
  page: number;
  totalPages: number;
};

// ---- 스캔한 안내문 (내 해석 기록) ----
// 기록 카드 한 개
export type ScannedSign = {
  scanId: number; // 누르면 이 ID로 상세(GET /api/signs/{scanId})를 연다
  fromPhoto: boolean; // 사진으로 해석했는지
  title: string; // 쉬운 설명 한 줄 (서버가 한국어로만 준다)
  scannedAt: string; // 해석한 시각 (ISO 문자열)
  imageUrl?: string; // 사진 해석 썸네일. 없으면 기본 이미지
};

// 기록 목록 한 페이지
export type ScannedSignPage = {
  signs: ScannedSign[];
  total: number;
  hasMore: boolean;
};

// GET /api/users/me/signs 응답 data
export type SignHistoryPageResponse = {
  items: {
    scanId: number;
    sourceType: "TEXT" | "IMAGE";
    title: string;
    thumbnailUrl: string | null; // 지금은 사진 해석도 null (서버가 원본 사진을 보관하지 않음)
    createdAt: string; // 시간대 없는 시각 "2026-11-26T04:11:39.377693"
  }[];
  page: number;
  totalElements: number;
  totalPages: number;
};
