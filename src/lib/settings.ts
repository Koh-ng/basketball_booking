import { db } from "@/db";
import { settings } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { BankInfo } from "./vietqr";

export type AppSettings = {
  bankCode: string;
  bankAccountNo: string;
  bankAccountName: string;
  adminEmail: string;
  /** Ảnh QR chuyển khoản admin tự upload (data URI), ưu tiên hơn VietQR tự tạo nếu có. */
  qrImage: string;
};

const DEFAULTS: AppSettings = {
  bankCode: "",
  bankAccountNo: "",
  bankAccountName: "",
  adminEmail: "",
  qrImage: "",
};

const KEY_MAP: Record<keyof AppSettings, string> = {
  bankCode: "bank_code",
  bankAccountNo: "bank_account_no",
  bankAccountName: "bank_account_name",
  adminEmail: "admin_email",
  qrImage: "qr_image",
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

export function bankInfoFrom(s: AppSettings): BankInfo | null {
  if (!s.bankCode || !s.bankAccountNo) return null;
  return {
    bankCode: s.bankCode,
    accountNo: s.bankAccountNo,
    accountName: s.bankAccountName,
  };
}
