import Link from "next/link";
import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { addMemberAction, toggleMemberAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireAdmin();
  const allMembers = await db.select().from(members).orderBy(members.name);

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">👥 Thành viên</h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>

      <form
        action={addMemberAction}
        className="mb-3.5 flex gap-2 rounded-2xl border border-ink/8 bg-white p-3.5"
      >
        <input
          type="text"
          name="name"
          placeholder="Tên thành viên mới"
          required
          className="flex-1 rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]"
        />
        <button className="rounded-[10px] bg-brand px-4 text-[13px] font-extrabold text-white hover:brightness-95">
          Thêm
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
        {allMembers.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border-b border-ink/6 px-3.5 py-3 last:border-b-0"
          >
            <span
              className={`text-sm font-semibold ${m.active ? "text-ink" : "text-ink/35 line-through"}`}
            >
              {m.name}
            </span>
            <form action={toggleMemberAction}>
              <input type="hidden" name="memberId" value={m.id} />
              <input
                type="hidden"
                name="active"
                value={m.active ? "false" : "true"}
              />
              <button className="rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-ink/3">
                {m.active ? "Ẩn khỏi danh sách" : "Kích hoạt lại"}
              </button>
            </form>
          </div>
        ))}
        {allMembers.length === 0 && (
          <div className="px-3.5 py-3 text-[13px] font-semibold text-ink/50">
            Chưa có thành viên nào — thêm ở trên nhé.
          </div>
        )}
      </div>
      <p className="mt-3 text-[11.5px] font-semibold text-ink/40">
        Thành viên bị ẩn sẽ không hiện trong danh sách vote của các kèo mới,
        nhưng lịch sử cũ vẫn giữ nguyên.
      </p>
    </div>
  );
}
