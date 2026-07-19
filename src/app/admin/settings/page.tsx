import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">⚙️ Cài đặt</h1>
        <Link href="/admin" className="text-sm text-zinc-500 underline">
          ← Quản lý
        </Link>
      </div>

      <form
        action={saveSettingsAction}
        className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200 space-y-4"
      >
        <div>
          <h2 className="font-semibold mb-1">Tài khoản nhận tiền (VietQR)</h2>
          <p className="text-xs text-zinc-400 mb-3">
            Dùng để tạo mã QR chuyển khoản đúng số tiền cho từng thành viên.
          </p>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-zinc-600">
                Mã ngân hàng (VD: VCB, TCB, MB, ACB, VPB...)
              </span>
              <input
                type="text"
                name="bankCode"
                defaultValue={s.bankCode}
                placeholder="VCB"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-zinc-600">Số tài khoản</span>
              <input
                type="text"
                name="bankAccountNo"
                defaultValue={s.bankAccountNo}
                placeholder="0123456789"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-zinc-600">
                Tên chủ tài khoản (không dấu)
              </span>
              <input
                type="text"
                name="bankAccountName"
                defaultValue={s.bankAccountName}
                placeholder="NGUYEN VAN A"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Email nhận nhắc nhở</h2>
          <p className="text-xs text-zinc-400 mb-3">
            Hệ thống gửi email nhắc bạn (thứ 6: nhắc vote/book sân, sáng CN:
            nhắc giờ chơi, thứ 3: nhắc thu tiền) kèm tin nhắn soạn sẵn để dán
            vào Messenger.
          </p>
          <input
            type="email"
            name="adminEmail"
            defaultValue={s.adminEmail}
            placeholder="ban@email.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <button className="w-full rounded-lg bg-orange-600 text-white py-2.5 font-semibold hover:bg-orange-700">
          Lưu cài đặt
        </button>
      </form>
    </div>
  );
}
