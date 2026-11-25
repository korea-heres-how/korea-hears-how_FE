import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/auth";
import NearbyPlacesProvider from "../contexts/NearbyPlacesProvider";

// 로그인하지 않았으면 안쪽 화면 대신 로그인 화면으로 보낸다.
// 지도와 주변 탭이 같은 주변 장소 조회 결과를 쓰도록 안쪽 화면을 NearbyPlacesProvider로 감싼다.
export default function RequireAuth() {
  const { user } = useAuth();
  return user ? (
    <NearbyPlacesProvider>
      <Outlet />
    </NearbyPlacesProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}
