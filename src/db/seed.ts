/**
 * Seed dữ liệu mẫu: chạy `npm run db:seed`
 * Sửa danh sách tên bên dưới thành thành viên thật của đội bạn.
 */
import { db } from "./index";
import { members } from "./schema";

const MEMBER_NAMES = [
  "Khoa",
  "Minh",
  "Tuấn",
  "Hùng",
  "Nam",
  "Đức",
  "Long",
  "Phong",
];

async function main() {
  await db
    .insert(members)
    .values(MEMBER_NAMES.map((name) => ({ name })))
    .onConflictDoNothing();
  console.log(`Đã seed ${MEMBER_NAMES.length} thành viên.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
