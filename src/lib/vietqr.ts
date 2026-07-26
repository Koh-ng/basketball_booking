export type BankInfo = {
  bankCode: string;
  accountNo: string;
  accountName: string;
};

/** URL ảnh QR chuyển khoản VietQR với số tiền và nội dung điền sẵn. */
export function vietQrUrl(
  bank: BankInfo,
  amount: number,
  addInfo: string,
): string {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo,
    accountName: bank.accountName,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(
    bank.bankCode,
  )}-${encodeURIComponent(bank.accountNo)}-compact2.png?${params.toString()}`;
}

/**
 * Mã app trong deep link VietQR (dl.vietqr.io) — chỉ những app đã xác nhận
 * được mã chính xác. Bấm link sẽ mở thẳng app đó, điền sẵn thông tin chuyển
 * khoản (tuỳ app có hỗ trợ tự điền hay chưa), không cần quét QR.
 */
export type BankAppId = "mb" | "vcb" | "tcb" | "acb" | "vib" | "vpb";

export const BANK_APPS: { id: BankAppId; label: string }[] = [
  { id: "mb", label: "MB Bank" },
  { id: "vcb", label: "Vietcombank" },
  { id: "tcb", label: "Techcombank" },
  { id: "acb", label: "ACB" },
  { id: "vib", label: "VIB" },
  { id: "vpb", label: "VPBank" },
];

/** Deep link mở thẳng 1 app ngân hàng cụ thể để chuyển khoản — xem BANK_APPS. */
export function vietQrDeepLink(
  bank: BankInfo,
  appId: BankAppId,
  amount: number,
  addInfo: string,
): string {
  const params = new URLSearchParams({
    app: appId,
    ba: `${bank.accountNo}@${bank.bankCode.toLowerCase()}`,
    am: String(amount),
    tn: addInfo,
    bn: bank.accountName,
  });
  return `https://dl.vietqr.io/pay?${params.toString()}`;
}
