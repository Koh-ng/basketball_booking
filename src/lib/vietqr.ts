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
 * được mã chính xác. Bấm link sẽ mở thẳng app đó (chưa tự điền được số
 * tiền/nội dung ở một số ngân hàng, tuỳ mức hỗ trợ hiện tại của VietQR).
 * Logo lấy từ CDN chính thức của VietQR (api.vietqr.io/img/{code}.png).
 */
export type BankAppId = "mb" | "vcb" | "tcb" | "acb" | "vib" | "vpb";

export const BANK_APPS: {
  id: BankAppId;
  label: string;
  logo: string;
  color: string;
}[] = [
  {
    id: "mb",
    label: "MB Bank",
    logo: "https://api.vietqr.io/img/MB.png",
    color: "#9F224E",
  },
  {
    id: "vcb",
    label: "Vietcombank",
    logo: "https://api.vietqr.io/img/VCB.png",
    color: "#00743E",
  },
  {
    id: "tcb",
    label: "Techcombank",
    logo: "https://api.vietqr.io/img/TCB.png",
    color: "#E30613",
  },
  {
    id: "acb",
    label: "ACB",
    logo: "https://api.vietqr.io/img/ACB.png",
    color: "#0033A0",
  },
  {
    id: "vib",
    label: "VIB",
    logo: "https://api.vietqr.io/img/VIB.png",
    color: "#F7941E",
  },
  {
    id: "vpb",
    label: "VPBank",
    logo: "https://api.vietqr.io/img/VPB.png",
    color: "#00A651",
  },
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
