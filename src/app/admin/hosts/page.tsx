import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listHostProfiles, MAX_HOST_PROFILES } from "@/lib/hostProfiles";
import { deleteHostProfileAction } from "../actions";
import { HostProfileForm } from "./HostProfileForm";

export const dynamic = "force-dynamic";

export default async function HostProfilesPage() {
  await requireAdmin();
  const hosts = await listHostProfiles();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">
          🧑‍💼 Người nhận tiền
        </h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>
      <p className="mb-3.5 text-[12.5px] font-semibold text-ink/50">
        Mỗi buổi có thể chọn 1 người host — QR chuyển khoản của buổi đó sẽ
        link đúng tài khoản người host. Tối đa {MAX_HOST_PROFILES} người.
      </p>

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
            + Thêm người host mới
          </h2>
          <HostProfileForm initial={null} />
        </div>
      )}
    </div>
  );
}
