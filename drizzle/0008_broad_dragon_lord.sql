ALTER TABLE "events" ALTER COLUMN "start_time" SET DEFAULT '11:00';--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_time" SET DEFAULT '13:00';--> statement-breakpoint
-- Cập nhật giờ chơi mặc định 10h-12h -> 11h-13h cho các buổi sắp tới chưa
-- diễn ra và chưa bị admin tự chỉnh giờ riêng; không đụng tới lịch sử.
UPDATE "events" SET "start_time" = '11:00', "end_time" = '13:00'
WHERE "status" = 'open' AND "start_time" = '10:00' AND "end_time" = '12:00';