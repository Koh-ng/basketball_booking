import Link from "next/link";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/memberAuth";
import { memberLogoutAction } from "../memberActions";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/";
  const [me, activeMembers] = await Promise.all([
    getCurrentMember(),
    db.select().from(members).where(eq(members.active, true)).orderBy(members.name),
  ]);

  return (
    <div>
      <h1 className="mb-3.5 text-[19px] font-extrabold text-ink">
        🔒 Đăng nhập
      </h1>

      {me && (
        <div className="mb-3.5 rounded-2xl border border-brand/20 bg-brand-soft p-3.5">
          <p className="text-[13px] font-bold text-ink">
            Bạn đang đăng nhập là <b>{me.name}</b>.
          </p>
          <div className="mt-2 flex gap-2">
            <Link
              href={nextPath}
              className="rounded-[10px] bg-brand px-3.5 py-2 text-[12.5px] font-bold text-white hover:brightness-95"
            >
              Tiếp tục
            </Link>
            <form action={memberLogoutAction}>
              <input type="hidden" name="next" value="/login" />
              <button className="rounded-[10px] border border-ink/15 bg-white px-3.5 py-2 text-[12.5px] font-bold text-ink hover:bg-ink/3">
                Đổi người khác
              </button>
            </form>
          </div>
        </div>
      )}

      {!me && <LoginForm members={activeMembers} next={nextPath} />}
    </div>
  );
}
