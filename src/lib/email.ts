import { Resend } from "resend";

/** Tách chuỗi email cách nhau bằng dấu phẩy/chấm phẩy/xuống dòng thành mảng, bỏ khoảng trắng thừa. */
export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/** Gửi email nhắc admin (1 hoặc nhiều người nhận). Trả kèm lý do nếu thất bại. */
export async function sendAdminEmail(
  to: string | string[],
  subject: string,
  body: string,
): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to : parseEmailList(to);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Chưa cấu hình RESEND_API_KEY" };
  }
  if (recipients.length === 0) {
    return { ok: false, error: "Chưa có email nhận" };
  }
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
    return { ok: false, error: `${error.name}: ${error.message}` };
  }
  return { ok: true };
}
