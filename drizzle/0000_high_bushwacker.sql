CREATE TABLE IF NOT EXISTS "cron_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job" varchar(64) NOT NULL,
	"ok" boolean DEFAULT true NOT NULL,
	"error" text,
	"ran_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"q" text,
	"naics" text[],
	"psc" text[],
	"setaside" text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sent_notice_ids" (
	"user_id" integer NOT NULL,
	"notice_id" varchar(128) NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sent_notice_ids_user_id_notice_id_pk" PRIMARY KEY("user_id","notice_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"plan" varchar(32) DEFAULT 'paid' NOT NULL,
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
