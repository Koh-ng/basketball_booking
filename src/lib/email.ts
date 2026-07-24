import nodemailer from "nodemailer";

/** Tách chuỗi email cách nhau bằng dấu phẩy/chấm phẩy/xuống dòng thành mảng, bỏ khoảng trắng thừa. */
export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Gửi email nhắc admin (1 hoặc nhiều người nhận) qua Gmail SMTP — miễn phí,
 * gửi được tới bất kỳ ai, không cần verify domain riêng như các dịch vụ
 * email transactional (Resend, SendGrid...).
 *
 * Cần 2 biến môi trường:
 *  - GMAIL_USER: địa chỉ Gmail dùng để gửi (VD abc@gmail.com)
 *  - GMAIL_APP_PASSWORD: mật khẩu ứng dụng 16 ký tự, tạo ở
 *    https://myaccount.google.com/apppasswords (cần bật xác minh 2 bước trước)
 */
export async function sendAdminEmail(
  to: string | string[],
  subject: string,
  body: string,
): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to : parseEmailList(to);
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return {
      ok: false,
      error: "Chưa cấu hình GMAIL_USER/GMAIL_APP_PASSWORD",
    };
  }
  if (recipients.length === 0) {
    return { ok: false, error: "Chưa có email nhận" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `Bóng Rổ <${user}>`,
      to: recipients,
      subject,
      text: body,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gửi email thất bại:", err);
    return { ok: false, error: message };
  }
}
