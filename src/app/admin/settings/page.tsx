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
        Hệ thống gửi email nhắc bạn (thứ 6: nhắc vote/book sân, sáng CN: nhắc
        giờ chơi, thứ 3: nhắc thu tiền) kèm tin nhắn soạn sẵn để dán vào
        Messenger. Thông tin ngân hàng/QR chuyển khoản nay quản lý ở mục{" "}
        <Link href="/admin/hosts" className="text-brand-dark underline">
          🧑‍💼 Quản lý
        </Link>
        .
      </p>
    </div>
  );
}
