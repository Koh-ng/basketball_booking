import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDateVN } from "@/lib/dates";
import { getEventById, getEventVotes, isEventFinished } from "@/lib/events";
import { getSettings } from "@/lib/settings";
import { EventAdminPanel } from "../../EventAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const event = await getEventById(Number(id));
  if (!event) notFound();

  const [data, settings] = await Promise.all([
    getEventVotes(event),
    getSettings(),
  ]);

  return (
    <div>
      <Link
        href="/admin/events"
        className="mb-3.5 inline-block text-[13px] font-bold text-ink/50"
      >
        ← Tất cả buổi
      </Link>
      <h1 className="mb-3 text-[19px] font-extrabold text-ink">
        {formatDateVN(event.eventDate)}{" "}
        <span className="text-[13px] font-semibold text-ink/50">
          · {event.startTime}–{event.endTime}
        </span>
      </h1>
      <EventAdminPanel
        data={data}
        settings={settings}
        showVoteReminders={!isEventFinished(event)}
      />
    </div>
  );
}
