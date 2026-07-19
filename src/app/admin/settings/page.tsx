import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">⚙️ Cài đặt</h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>

      <SettingsForm initial={s} />

      <p className="mt-3 text-[11.5px] font-semibold text-ink/40">
        Nếu không tải ảnh QR lên, app tự tạo mã QR (VietQR) đúng số tiền cho
        từng người dựa vào thông tin ngân hàng ở trên. Hệ thống gửi email
        nhắc bạn (thứ 6: nhắc vote/book sân, sáng CN: nhắc giờ chơi, thứ 3:
        nhắc thu tiền) kèm tin nhắn soạn sẵn để dán vào Messenger.
      </p>
    </div>
  );
}
