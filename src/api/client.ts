// 모든 API 요청이 거쳐가는 공통 클라이언트.
// - 로그인한 상태면 Authorization: Bearer <토큰>을 자동으로 붙인다.
// - 서버 응답 { success, code, message, data }에서 data만 꺼내 돌려준다.
// - 실패하면 ApiError를 던진다. 토큰이 만료되거나 잘못돼서 401이 오면 로그아웃 처리를 부른다.

// 개발 중에는 비워둔다 → vite 프록시(vite.config.ts)가 /api 요청을 서버로 넘겨준다.
// 배포할 때는 .env의 VITE_API_BASE_URL에 서버 주소를 넣는다. (서버에 CORS 허용이 필요)
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// 서버가 내려주는 공통 응답 형태
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

// 서버가 실패 응답을 줬을 때 던지는 오류. code로 어떤 실패인지 구분한다. (예: INVALID_CREDENTIALS)
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// ---- 토큰 보관 ----
// 로그인 정보와 같은 sessionStorage에 둔다. (새로고침하면 유지, 탭을 닫으면 지워짐)
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// 로그인한 상태에서 401이 오면 부를 함수 (AuthProvider가 로그아웃을 등록한다)
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown; // 객체는 JSON으로, FormData는 그대로 보낸다
  query?: Record<string, string | number | boolean | undefined>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;

  let url = `${BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: requestBody });

  // 실패 응답도 { success:false, code, message } 형태라서 먼저 읽어본다.
  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    // 본문이 없거나 JSON이 아닌 응답
  }

  if (!res.ok || (json && json.success === false)) {
    if (res.status === 401 && accessToken) onUnauthorized?.();
    throw new ApiError(res.status, json?.code ?? "UNKNOWN", json?.message ?? `요청에 실패했어요 (${res.status})`);
  }

  return json?.data as T;
}
