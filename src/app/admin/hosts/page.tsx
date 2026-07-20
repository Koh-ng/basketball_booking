import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listHostProfiles, MAX_HOST_PROFILES } from "@/lib/hostProfiles";
import { getSettings } from "@/lib/settings";
import { deleteHostProfileAction, setDefaultHostAction } from "../actions";
import { HostProfileForm } from "./HostProfileForm";

export const dynamic = "force-dynamic";

export default async function HostProfilesPage() {
  await requireAdmin();
  const [hosts, settings] = await Promise.all([
    listHostProfiles(),
    getSettings(),
  ]);

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">🧑‍💼 Quản lý</h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>
      <p className="mb-3.5 text-[12.5px] font-semibold text-ink/50">
        Mỗi buổi có thể chọn 1 người quản lý — QR chuyển khoản của buổi đó sẽ
        link đúng tài khoản người đó. Tối đa {MAX_HOST_PROFILES} người.
      </p>

      {hosts.length > 0 && (
        <form
          action={setDefaultHostAction}
          className="mb-3.5 flex items-center gap-2 rounded-2xl border border-ink/8 bg-white p-3.5"
        >
          <label className="shrink-0 text-[12.5px] font-bold text-ink/60">
            Người quản lý mặc định:
          </label>
          <select
            name="defaultHostId"
            defaultValue={settings.defaultHostId}
            className="flex-1 rounded-[10px] border border-ink/15 px-2.5 py-2 text-[12.5px]"
          >
            <option value="">— Không có —</option>
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <button className="shrink-0 rounded-[10px] border border-ink/15 bg-white px-3 py-2 text-[12px] font-bold text-ink hover:bg-ink/3">
            Lưu
          </button>
        </form>
      )}
      {hosts.length > 0 && (
        <p className="mb-3.5 -mt-2 text-[11.5px] font-semibold text-ink/40">
          Buổi nào chưa chọn người quản lý riêng sẽ tự dùng người này.
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {hosts.map((h) => (
          <div key={h.id}>
            <HostProfileForm initial={h} />
            <form action={deleteHostProfileAction} className="mt-1.5">
              <input type="hidden" name="hostId" value={h.id} />
              <button className="w-full rounded-xl border border-danger-border bg-danger-bg py-2.5 text-[12.5px] font-bold text-danger hover:brightness-95">
                Xoá {h.name}
              </button>
            </form>
          </div>
        ))}
      </div>

      {hosts.length < MAX_HOST_PROFILES && (
        <div className="mt-3.5">
          <h2 className="mb-2 text-[13px] font-extrabold text-ink/60">
            + Thêm người quản lý mới
          </h2>
          <HostProfileForm initial={null} />
        </div>
      )}
    </div>
  );
}
