import { Resend } from "resend";

/**
 * Gửi email nhắc admin. Bỏ qua êm thấm nếu chưa cấu hình
 * RESEND_API_KEY hoặc chưa có email nhận.
 */
export async function sendAdminEmail(
  to: string,
  subject: string,
  body: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return false;
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "Bóng Rổ <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: body,
  });
  if (error) {
    console.error("Gửi email thất bại:", error);
    return false;
  }
  return true;
}
