import { apiRequest } from "../client";
import type { MyProfileResponse, Profile } from "./types";

// GET /api/users/me
// 토큰으로 본인을 알아내므로 사용자 ID는 보내지 않는다.
export async function getMe(): Promise<Profile> {
  const data = await apiRequest<MyProfileResponse>("/api/users/me");
  return { name: data.name, email: data.email };
}
