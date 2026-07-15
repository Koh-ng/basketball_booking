/** Chia đều tổng chi phí cho số người, làm tròn LÊN nghìn đồng. */
export function perPersonAmount(totalCost: number, goingCount: number): number {
  if (goingCount <= 0) return 0;
  return Math.ceil(totalCost / goingCount / 1000) * 1000;
}

/** 150000 -> "150.000đ" */
export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}
