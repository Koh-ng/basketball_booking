import { NextResponse } from "next/server";
import { icsContent } from "@/lib/calendar";
import { getEventById } from "@/lib/events";

export const dynamic = "force-dynamic";

/** Tải file .ics để thêm buổi chơi vào lịch điện thoại (Apple/Android). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await getEventById(Number(id));
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(icsContent(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bongro-${event.eventDate}.ics"`,
    },
  });
}
