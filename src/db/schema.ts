import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Profile của admin nhận tiền (tối đa 4) — mỗi buổi chọn 1 người host để QR
// chuyển khoản link đúng tài khoản người đó.
export const hostProfiles = pgTable("host_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  bankCode: text("bank_code").notNull().default(""),
  bankAccountNo: text("bank_account_no").notNull().default(""),
  bankAccountName: text("bank_account_name").notNull().default(""),
  qrImage: text("qr_image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Một "buổi" chơi bóng. status: open -> settled -> completed, hoặc open -> cancelled
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventDate: date("event_date").notNull().unique(),
  startTime: text("start_time").notNull().default("10:00"),
  endTime: text("end_time").notNull().default("12:00"),
  status: text("status", {
    enum: ["open", "settled", "completed", "cancelled"],
  })
    .notNull()
    .default("open"),
  totalCost: integer("total_cost"),
  note: text("note"),
  // Người host nhận tiền của buổi này (null = dùng tài khoản mặc định ở Cài đặt)
  hostId: integer("host_id").references(() => hostProfiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    going: boolean("going").notNull(),
    // Số khách đi kèm (0-5), chỉ có nghĩa khi going = true
    guests: integer("guests").notNull().default(0),
    // Tên khách đi kèm (không bắt buộc), VD "Tuấn, Minh"
    guestNames: text("guest_names"),
    paid: boolean("paid").notNull().default(false),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("votes_event_member_unique").on(t.eventId, t.memberId)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Member = typeof members.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type HostProfile = typeof hostProfiles.$inferSelect;
