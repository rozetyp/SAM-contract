CREATE TABLE IF NOT EXISTS cron_runs (
  id serial PRIMARY KEY,
  job varchar(64) NOT NULL,
  ok boolean NOT NULL DEFAULT true,
  error text,
  ran_at timestamp NOT NULL DEFAULT now()
);