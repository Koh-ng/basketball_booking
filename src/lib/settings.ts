import { db } from "@/db";
import { settings } from "@/db/schema";
import { sql } from "drizzle-orm";

export type AppSettings = {
  adminEmail: string;
  /** id (dạng chuỗi) của người quản lý mặc định — áp dụng cho buổi chưa chọn người thu tiền. */
  defaultHostId: string;
};

const DEFAULTS: AppSettings = {
  adminEmail: "",
  defaultHostId: "",
};

const KEY_MAP: Record<keyof AppSettings, string> = {
  adminEmail: "admin_email",
  defaultHostId: "default_host_id",
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await db.select().from(settings);
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const result = { ...DEFAULTS };
  for (const [field, key] of Object.entries(KEY_MAP)) {
    if (byKey[key] !== undefined) {
      result[field as keyof AppSettings] = byKey[key];
    }
  }
  return result;
}

export async function saveSettings(values: Partial<AppSettings>) {
  const rows = Object.entries(values)
    .filter(([field]) => field in KEY_MAP)
    .map(([field, value]) => ({
      key: KEY_MAP[field as keyof AppSettings],
      value: value ?? "",
    }));
  if (rows.length === 0) return;
  await db
    .insert(settings)
    .values(rows)
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: sql`excluded.value` },
    });
}
