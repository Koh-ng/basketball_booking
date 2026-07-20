import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/memberAuth";
import { memberLogoutAction } from "../memberActions";
import { ChangePinForm } from "./ChangePinForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login?next=/account");

  return (
    <div>
      <h1 className="mb-3.5 text-[19px] font-extrabold text-ink">
        👤 Tài khoản của {me.name}
      </h1>

      {me.pinHash === null && (
        <p className="mb-3.5 text-[12.5px] font-semibold text-amber">
          Bạn đang dùng mã PIN mặc định (123456) — đổi ở dưới nếu muốn cho
          chắc.
        </p>
      )}

      <ChangePinForm />

      <form action={memberLogoutAction} className="mt-3.5">
        <input type="hidden" name="next" value="/" />
        <button className="w-full rounded-xl border border-ink/15 bg-white py-2.5 text-[13px] font-bold text-ink hover:bg-ink/3">
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
