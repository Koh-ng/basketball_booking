import { Resend } from "resend";

/** Tách chuỗi email cách nhau bằng dấu phẩy/chấm phẩy/xuống dòng thành mảng, bỏ khoảng trắng thừa. */
export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Gửi email nhắc admin (1 hoặc nhiều người nhận). Bỏ qua êm thấm nếu chưa
 * cấu hình RESEND_API_KEY hoặc chưa có email nhận.
 */
export async function sendAdminEmail(
  to: string | string[],
  subject: string,
  body: string,
): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : parseEmailList(to);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || recipients.length === 0) return false;
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "Bóng Rổ <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    text: body,
  });
  if (error) {
    console.error("Gửi email thất bại:", error);
    return false;
  }
  return true;
}
