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
