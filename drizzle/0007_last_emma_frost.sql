ALTER TABLE "votes" ADD COLUMN "transferred" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "transferred_at" timestamp with time zone;