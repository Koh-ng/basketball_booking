export const metadata = {
  title: "Luật — Bóng Rổ Chủ Nhật",
};

const RULES = [
  "Anh em vui vẻ lành mạnh, không hơn thua cạnh tranh",
  "Khi chơi không bạo lực, xô xát, cố ý đẩy hay chơi lỗi, nếu xảy ra cãi nhau sẽ bị cấm chơi",
  "Nếu dẫn người quen thì hãy chủ động rủ những người match vibe anh em trong hội",
  "Hãy cố gắng đảm bảo người bạn dẫn đi cùng sẽ đi, tránh trường hợp không đủ người chơi",
  "Đi lâu dài thì add Facebook, add group trên Messenger",
  "Báo trước nếu không đi thường xuyên hoặc nghỉ hẳn",
  "Nếu không đi thì nên cập nhật 1 ngày trước buổi chơi, nếu không thì vẫn sẽ tính và đóng tiền",
  "Nếu kẹt không đi thường xuyên được (vắng liên tục từ 4 buổi trở lên), tụi mình xin phép remove khỏi group trước — khi nào đi đều lại được thì add lại ngay, để nhóm luôn active và duy trì sân chơi kỷ luật cho anh em mỗi tuần",
];

export default function RulesPage() {
  return (
    <div>
      <h1 className="mb-3.5 text-[20px] font-extrabold text-ink">
        📜 Luật của hội
      </h1>
      <div className="rounded-2xl border border-ink/8 bg-white p-4">
        <ol className="flex flex-col">
          {RULES.map((rule, i) => (
            <li
              key={i}
              className="flex gap-3 border-b border-ink/6 py-3 first:pt-1 last:border-b-0 last:pb-1"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-extrabold text-brand">
                {i + 1}
              </span>
              <span className="text-[13.5px] leading-relaxed font-semibold text-ink">
                {rule}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-center text-[12.5px] font-semibold text-ink/45">
        Chơi đẹp, vui là chính 🏀
      </p>
    </div>
  );
}
