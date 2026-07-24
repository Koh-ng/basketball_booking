# 🏀 Bóng Rổ Chủ Nhật — App vote kèo & chia tiền sân

Web app cho đội bóng rổ chơi cố định **sáng Chủ nhật 10h–12h** hàng tuần:

- **Tự tạo kèo hàng tuần** — mỗi tuần tự động có kèo mới cho Chủ nhật sắp tới
- **Vote không cần đăng nhập** — thành viên mở link, chọn tên mình, bấm Đi / Không đi
- **Nhắc nhở bán tự động** — hệ thống email cho admin kèm tin nhắn soạn sẵn (thứ 6 nhắc vote + book sân, sáng Chủ nhật nhắc giờ chơi, thứ 3 nhắc thu tiền); trên trang quản lý có nút **Copy tin nhắn** để dán vào group Messenger
- **Chia tiền & tracking** — admin nhập tổng chi phí, app chia đều (làm tròn lên nghìn đồng), mỗi thành viên thấy số tiền + **mã QR VietQR** đúng số tiền để chuyển khoản; admin tick ai đã chuyển để theo dõi

## Tech stack

Next.js (App Router) · Tailwind CSS · Drizzle ORM · PostgreSQL (Neon) · Vercel Cron · Resend (email) · VietQR

## Chạy local

```bash
npm install
cp .env.example .env          # sửa DATABASE_URL, ADMIN_PIN, CRON_SECRET
npm run db:migrate            # tạo bảng
npm run db:seed               # (tuỳ chọn) seed thành viên mẫu — sửa tên trong src/db/seed.ts
npm run dev                   # mở http://localhost:3000
```

## Deploy lên Vercel (miễn phí)

1. **Tạo database Neon**: vào [neon.tech](https://neon.tech) → tạo project → copy **connection string**
2. **Import repo vào Vercel**: [vercel.com/new](https://vercel.com/new) → chọn repo này → khai báo Environment Variables:

   | Biến | Giá trị |
   |---|---|
   | `DATABASE_URL` | connection string của Neon |
   | `ADMIN_PIN` | mã PIN đăng nhập trang `/admin` |
   | `CRON_SECRET` | chuỗi ngẫu nhiên dài (bảo vệ endpoint cron) |
   | `RESEND_API_KEY` | API key từ [resend.com](https://resend.com) (bỏ trống nếu chưa cần email) |
   | `ADMIN_EMAIL` | email của bạn để nhận nhắc nhở |
   | `NEXT_PUBLIC_APP_URL` | URL app sau khi deploy, VD `https://bongro.vercel.app` |

   Bảng (`events`, `members`, `votes`, `settings`) được tự động tạo trong lúc Vercel build (script `vercel-build` chạy `drizzle-kit migrate` trước `next build`) — không cần chạy migration tay.
3. **Thêm thành viên**: sau khi deploy xong, vào `/admin/members` (đăng nhập bằng `ADMIN_PIN`) để thêm tên từng người trong đội — không cần seed sẵn.
4. **Cron tự chạy**: `vercel.json` đã khai báo cron mỗi ngày lúc 8h sáng VN — Vercel tự gắn header `Authorization: Bearer $CRON_SECRET`. Cron sẽ:
   - hàng ngày: đảm bảo tồn tại buổi cho Chủ nhật sắp tới + xoá buổi đã hủy quá 30 ngày
   - **thứ 5**: email nhắc đặt sân cho buổi Chủ nhật tuần này (kèm tin đặt sân soạn sẵn)
   - thứ 6: email nhắc bạn đăng tin vote + book sân
   - thứ 7: tự hủy buổi nếu chưa đủ người (mặc định 8)
   - Chủ nhật 8h: email nhắc giờ chơi kèm danh sách chốt
   - **thứ 2**: email nhắc ai chưa chuyển tiền buổi vừa rồi + nhắc vote buổi sắp tới
   - thứ 3: email nhắc thu tiền nếu còn người chưa chuyển

   > ⚠️ Các email chỉ gửi được khi đã có `RESEND_API_KEY` **và** người nhận
   > (`ADMIN_EMAIL` env hoặc email admin trong trang Cài đặt). Thiếu 1 trong 2 thì
   > cron vẫn chạy nhưng bỏ qua việc gửi mail (không báo lỗi).

### Test thử cron ở local

Endpoint cron nhận query `?simulate=<thứ>` để giả lập thứ trong tuần —
**chỉ hoạt động ở local dev** (`NODE_ENV !== "production"`), không dùng được trên
bản deploy. `0` = Chủ nhật … `6` = thứ 7. Nhớ gắn header `CRON_SECRET`:

```bash
# chạy dev server trước: npm run dev
# thứ 5 — email số người tham gia
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron?simulate=4"
# thứ 2 — email ai đã/chưa chuyển tiền
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron?simulate=1"
```

Phản hồi JSON có mảng `actions` cho biết email đã `sent` hay `skipped`
(`skipped` = chưa cấu hình `RESEND_API_KEY`/email nhận).

## Sử dụng hàng tuần

1. Gửi link app vào group Messenger (dùng nút **Copy tin nhắc vote** trong trang Quản lý)
2. Thành viên vào chọn tên → bấm **Đi** — bạn theo dõi số người để book sân
3. Sau buổi chơi, vào **Quản lý** → nhập tổng chi phí → **Chốt chia tiền**
4. Thành viên mở app thấy số tiền + QR VietQR đúng số tiền của mình
5. Ai chuyển khoản rồi thì bạn tick **Đã chuyển** — còn thiếu ai, bấm **Copy tin nhắc chuyển khoản** dán vào group

## Cài đặt trong app

Vào `/admin` (đăng nhập bằng `ADMIN_PIN`):

- **Thành viên**: thêm / ẩn thành viên
- **Cài đặt**: mã ngân hàng + số tài khoản + tên chủ TK (để tạo QR VietQR), email nhận nhắc nhở
- **Buổi**: hủy buổi (mưa gió...), ghi chú sân, sửa lại tổng chi phí

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | chạy dev server |
| `npm run build` | build production |
| `npm run db:generate` | tạo file migration mới sau khi sửa `src/db/schema.ts` |
| `npm run db:migrate` | áp migration vào database |
| `npm run db:seed` | seed danh sách thành viên mẫu |

<!-- redeploy-trigger: 2026-07-19T12:30:11Z — buộc build lại production sau khi repo chuyển public -->
