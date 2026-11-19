import { ApiError, apiRequest } from "../client";

// 로그인에 성공하면 앱에 보관하는 값
export type LoginResult = {
  accessToken: string;
  email: string;
};

// 서버 응답 data 중 화면에서 쓰는 필드만 적어둔다.
type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: { email: string };
};

// 이메일 또는 비밀번호가 틀렸을 때 던지는 오류
export class LoginFailedError extends Error {
  constructor() {
    super("아이디나 비밀번호가 틀렸습니다");
    this.name = "LoginFailedError";
  }
}

// POST /api/auth/login
// 이메일 인증을 마친 계정만 로그인된다. 틀리면 401 INVALID_CREDENTIALS.
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const data = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return { accessToken: data.accessToken, email: data.user.email };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) throw new LoginFailedError();
    throw e;
  }
}
