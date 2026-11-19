import type { ComponentProps } from "react";
import PlaceListCard from "../../../components/PlaceListCard";
import { usePlaceImage } from "./usePlaceImage";

type NearbyListCardProps = Omit<ComponentProps<typeof PlaceListCard>, "imageUrl"> & {
  placeId: string;
};

// 바텀시트를 끝까지 올렸을 때의 세로 목록 카드.
// 공용 PlaceListCard에 "화면에 보이면 사진 불러오기"만 더한 것.
export default function NearbyListCard({ placeId, ...cardProps }: NearbyListCardProps) {
  const { ref, imageUrl } = usePlaceImage<HTMLDivElement>(placeId);
  return (
    <div ref={ref}>
      <PlaceListCard {...cardProps} imageUrl={imageUrl} />
    </div>
  );
}
