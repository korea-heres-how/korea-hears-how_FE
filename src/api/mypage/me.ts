import { apiRequest, toServerUrl } from "../client";
import type { MyProfileResponse, Profile } from "./types";

// GET /api/users/me
// 토큰으로 본인을 알아내므로 사용자 ID는 보내지 않는다.
export async function getMe(): Promise<Profile> {
  const data = await apiRequest<MyProfileResponse>("/api/users/me");
  return {
    name: data.name,
    email: data.email,
    // 상대경로면 서버 주소를 붙여서 화면에 띄울 수 있게 한다.
    imageUrl: data.profileImageUrl ? toServerUrl(data.profileImageUrl) : undefined,
  };
}
