import { getCurrentMember } from "@/lib/memberAuth";
import { FeedbackForm } from "./FeedbackForm";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const me = await getCurrentMember();

  return (
    <div>
      <h1 className="mb-2 text-[19px] font-extrabold text-ink">
        💬 Góp ý &amp; báo lỗi
      </h1>
      <p className="mb-3.5 text-[12.5px] font-semibold text-ink/50">
        Gặp lỗi hay muốn đề xuất tính năng mới cho app? Để lại ở đây, tụi mình
        sẽ ghi nhận và cải thiện.
      </p>
      <FeedbackForm authorName={me?.name ?? null} />
    </div>
  );
}
