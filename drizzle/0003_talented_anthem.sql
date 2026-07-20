CREATE TABLE "host_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bank_code" text DEFAULT '' NOT NULL,
	"bank_account_no" text DEFAULT '' NOT NULL,
	"bank_account_name" text DEFAULT '' NOT NULL,
	"qr_image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "host_profiles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "host_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_host_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."host_profiles"("id") ON DELETE set null ON UPDATE no action;