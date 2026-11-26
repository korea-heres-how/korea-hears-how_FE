// 서버 시각 중 시간대가 없는 값("2026-11-26T04:11:39.377693")은 UTC로 보고 읽는다.
// 이미 Z나 +09:00 같은 시간대가 붙어 있으면 그대로 둔다.
export function toUtcIso(value: string) {
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
}
