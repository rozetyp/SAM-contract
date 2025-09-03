ALTER TABLE "searches" ADD COLUMN "q_keywords_include" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "q_keywords_exclude" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "ncode" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "ccode" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "type_of_set_aside" text[];--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "organization_name" text;--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "organization_code" text;