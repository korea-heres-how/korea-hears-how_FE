import { useEffect, useState } from "react";
import { getScannedSigns, type ScannedSign } from "../../api/mypage";
import scan from "../../assets/mypage/scan.svg";
import { useT } from "../../contexts/language";
import ListPageLayout from "./components/ListPageLayout";
import SignCard from "./components/SignCard";

// 마이페이지 스캔한 안내문 "전체 보기" 화면 (/mypage/scans)
export default function ScannedSignsPage() {
  const t = useT();
  const [signs, setSigns] = useState<ScannedSign[]>([]);

  useEffect(() => {
    getScannedSigns()
      .then(setSigns)
      .catch((e) => console.error(e));
  }, []);

  return (
    <ListPageLayout
      icon={scan}
      title={t("스캔한 안내문", "Scanned signs")}
      sub={t("Scanned signs", "스캔한 안내문")}
      description={t(
        "사진을 찍거나 입력해서 해석한 안내문 기록이에요.",
        "Signs you've photographed or typed in to get explained.",
      )}
      count={signs.length}
      emptyText={t("스캔한 안내문이 없습니다.", "No scanned signs yet.")}
    >
      {signs.map((sign) => (
        <SignCard key={sign.id} sign={sign} />
      ))}
    </ListPageLayout>
  );
}
