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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">👥 Thành viên</h1>
        <Link href="/admin" className="text-sm text-zinc-500 underline">
          ← Quản lý
        </Link>
      </div>

      <form
        action={addMemberAction}
        className="flex gap-2 rounded-xl bg-white p-4 shadow-sm border border-zinc-200"
      >
        <input
          type="text"
          name="name"
          placeholder="Tên thành viên mới"
          required
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button className="rounded-lg bg-orange-600 text-white px-4 py-2 font-semibold hover:bg-orange-700">
          Thêm
        </button>
      </form>

      <ul className="rounded-xl bg-white shadow-sm border border-zinc-200 divide-y divide-zinc-100">
        {allMembers.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className={m.active ? "" : "text-zinc-400 line-through"}>
              {m.name}
            </span>
            <form action={toggleMemberAction}>
              <input type="hidden" name="memberId" value={m.id} />
              <input
                type="hidden"
                name="active"
                value={m.active ? "false" : "true"}
              />
              <button className="text-xs font-medium rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50">
                {m.active ? "Ẩn khỏi danh sách" : "Kích hoạt lại"}
              </button>
            </form>
          </li>
        ))}
        {allMembers.length === 0 && (
          <li className="px-4 py-3 text-sm text-zinc-500">
            Chưa có thành viên nào — thêm ở trên nhé.
          </li>
        )}
      </ul>
      <p className="text-xs text-zinc-400">
        Thành viên bị ẩn sẽ không hiện trong danh sách vote của các kèo mới,
        nhưng lịch sử cũ vẫn giữ nguyên.
      </p>
    </div>
  );
}
