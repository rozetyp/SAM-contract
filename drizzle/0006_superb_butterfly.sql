CREATE TABLE IF NOT EXISTS "trending_terms" (
	"window" varchar(3) NOT NULL,
	"term" text NOT NULL,
	"score" numeric NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL,
	"captured_date" date NOT NULL,
	CONSTRAINT "trending_terms_window_term_captured_date_pk" PRIMARY KEY("window","term","captured_date")
);
