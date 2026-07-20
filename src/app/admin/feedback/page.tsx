import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeVN } from "@/lib/dates";
import {
  FEEDBACK_CATEGORY_LABEL,
  FEEDBACK_STATUS_BADGE,
  FEEDBACK_STATUS_LABEL,
  listFeedback,
} from "@/lib/feedback";
import { toggleFeedbackStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const rows = await listFeedback();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">
          💬 Góp ý &amp; báo lỗi
        </h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>

      {rows.length === 0 && (
        <p className="text-[13px] font-semibold text-ink/50">
          Chưa có góp ý nào.
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {rows.map(({ feedback: f, member }) => (
          <div
            key={f.id}
            className="rounded-2xl border border-ink/8 bg-white p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-ink/60">
                {FEEDBACK_CATEGORY_LABEL[f.category]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${FEEDBACK_STATUS_BADGE[f.status]}`}
              >
                {FEEDBACK_STATUS_LABEL[f.status]}
              </span>
            </div>
            <p className="mt-2 text-[13.5px] whitespace-pre-wrap text-ink">
              {f.message}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <p className="text-[11.5px] font-semibold text-ink/40">
                {member ? member.name : "Ẩn danh"} ·{" "}
                {formatDateTimeVN(f.createdAt)}
              </p>
              <form action={toggleFeedbackStatusAction}>
                <input type="hidden" name="feedbackId" value={f.id} />
                <input
                  type="hidden"
                  name="status"
                  value={f.status === "new" ? "reviewed" : "new"}
                />
                <button className="shrink-0 rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink transition-all duration-150 hover:bg-ink/3 active:scale-[0.96]">
                  {f.status === "new" ? "Đánh dấu đã ghi nhận" : "Đánh dấu mới"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
