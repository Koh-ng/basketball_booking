export const metadata = {
  title: "Hướng dẫn — Bóng Rổ Chủ Nhật",
};

function Step({
  n,
  title,
  children,
  img,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  img?: string;
}) {
  return (
    <div className="flex gap-3 border-b border-ink/6 py-3.5 first:pt-1 last:border-b-0 last:pb-1">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-extrabold text-brand">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-extrabold text-ink">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed font-semibold text-ink/60">
          {children}
        </p>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={title}
            className="mt-2.5 w-full max-w-[280px] rounded-xl border border-ink/8"
          />
        )}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div>
      <h1 className="mb-1 text-[20px] font-extrabold text-ink">
        📖 Hướng dẫn sử dụng
      </h1>
      <p className="mb-3.5 text-[13px] font-semibold text-ink/50">
        Cách vote kèo hàng tuần và chuyển tiền sân sau mỗi buổi chơi.
      </p>

      <h2 className="mb-2 text-[15px] font-extrabold text-ink">
        1️⃣ Vote đi/không đi
      </h2>
      <div className="rounded-2xl border border-ink/8 bg-white p-4">
        <Step n={1} title="Đăng nhập bằng tên của bạn" img="/guide/01-login.png">
          Bấm <b className="text-ink">Đăng nhập</b> ở góc trên, chọn tên mình
          trong danh sách và nhập mã PIN (mặc định là{" "}
          <b className="text-ink">123456</b> nếu chưa từng đổi). Việc này chỉ
          cần làm 1 lần, app sẽ nhớ cho lần sau.
        </Step>
        <Step n={2} title="Vote Đi / Không đi cho buổi sắp tới" img="/guide/02-vote.png">
          Vào trang chủ, thấy buổi sắp tới hiện ngay trên cùng. Bấm{" "}
          <b className="text-success">✅ Đi</b> nếu tham gia, hoặc{" "}
          <b className="text-ink/60">❌ Không đi</b> nếu không. Có thể đổi vote
          bất cứ lúc nào trước giờ chơi.
        </Step>
        <Step n={3} title="Dẫn thêm bạn bè đi cùng (nếu có)" img="/guide/03-vote-guest.png">
          Sau khi bấm Đi, app sẽ hỏi{" "}
          <b className="text-ink">&quot;Bạn có dẫn thêm ai đi không?&quot;</b>.
          Chọn <b className="text-ink">Có</b>, chọn số lượng người và có thể
          ghi tên (không bắt buộc). Áp dụng cho cả bạn bè trong nhóm lẫn khách
          vãng lai ngoài nhóm.
        </Step>
        <Step n={4} title="Theo dõi danh sách đi/không đi">
          Ngay dưới phần vote là danh sách ai đã{" "}
          <b className="text-success">Đi</b>, ai{" "}
          <b className="text-ink/60">Không đi</b> và ai{" "}
          <b className="text-amber">Chưa vote</b>, cập nhật realtime cho mọi
          người xem chung.
        </Step>
      </div>

      <h2 className="mt-4 mb-2 text-[15px] font-extrabold text-ink">
        2️⃣ Sau buổi chơi — chuyển tiền sân
      </h2>
      <div className="rounded-2xl border border-ink/8 bg-white p-4">
        <Step n={1} title="Admin chốt tổng chi phí">
          Sau khi chơi xong, admin nhập tổng tiền sân/nước vào hệ thống. App
          tự động chia đều cho tất cả người tham gia (tính cả khách vãng lai
          là 1 suất).
        </Step>
        <Step n={2} title="Xem số tiền cần chuyển" img="/guide/04-payment.png">
          Quay lại trang chủ hoặc trang buổi đó, phần{" "}
          <b className="text-ink">💸 Tiền sân</b> sẽ hiện rõ số tiền bạn cần
          chuyển, kèm mã QR VietQR đã điền sẵn số tiền + nội dung chuyển
          khoản.
        </Step>
        <Step n={3} title="Chuyển khoản: quét QR hoặc bấm mở app ngân hàng">
          Có 2 cách: (1) dùng app ngân hàng bất kỳ quét mã QR hiển thị, hoặc
          (2) bấm thẳng vào nút ngân hàng bạn dùng (MB Bank, Vietcombank,
          Techcombank, ACB, VIB, VPBank, TPBank...) để mở app đó ngay — lưu ý
          vẫn cần tự kiểm tra lại số tiền/nội dung trước khi xác nhận chuyển.
        </Step>
        <Step n={4} title="Admin xác nhận đã nhận tiền">
          Khi admin thấy tiền về, sẽ tick trạng thái{" "}
          <b className="text-success">Đã chuyển ✓</b> cho bạn trong danh sách
          — vậy là xong, không cần báo lại.
        </Step>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-border bg-amber-bg p-4">
        <p className="text-[14px] font-extrabold text-ink">
          🎒 Dẫn khách vãng lai (không có trong nhóm)?
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed font-semibold text-ink/70">
          Khách vãng lai không tự vote hay tự chuyển khoản trong app — người{" "}
          <b className="text-ink">rủ khách đi cùng</b> sẽ vote hộ (chọn Đi,
          dẫn thêm 1 khách như hướng dẫn ở bước 3 phía trên) và{" "}
          <b className="text-ink">chuyển tiền gộp luôn phần của khách đó</b>.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed font-semibold text-ink/70">
          Ví dụ: Nam rủ bạn Tuấn (không có trong nhóm) đi chơi cùng. Nam vote
          Đi, dẫn thêm 1 khách, ghi tên Tuấn. Khi chốt tiền, Nam sẽ thấy số
          tiền hiển thị đã gồm cả phần của mình lẫn phần của Tuấn (VD:{" "}
          <i>&quot;chuyển 60.000đ (bạn + 2 khách)&quot;</i>) và chỉ cần chuyển
          1 lần duy nhất — Tuấn không cần cài app hay tự thanh toán.
        </p>
      </div>

      <p className="mt-3.5 text-center text-[12.5px] font-semibold text-ink/45">
        Có thắc mắc gì cứ hỏi trong group nhé 🏀
      </p>
    </div>
  );
}
