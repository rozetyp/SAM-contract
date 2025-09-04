CREATE TABLE IF NOT EXISTS "exclusion_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"watch_id" integer NOT NULL,
	"exclusion_id" text NOT NULL,
	"seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exclusion_watches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"entity" text,
	"uei" text,
	"last_seen_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cron_runs" ALTER COLUMN "job" SET DEFAULT 'opps';--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "finished_at" timestamp;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "duration_ms" integer;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "total_records" integer;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "sent_count" integer;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "status" varchar(32) DEFAULT 'running' NOT NULL;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "err_code" varchar(64);--> statement-breakpoint
ALTER TABLE "cron_runs" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "mute_terms" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "mute_agencies" text[];