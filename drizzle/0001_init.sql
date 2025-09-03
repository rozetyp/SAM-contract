CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  plan varchar(32) NOT NULL DEFAULT 'paid',
  stripe_customer_id varchar(255),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS searches (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  q text,
  naics text[],
  psc text[],
  setaside text[]
);

CREATE TABLE IF NOT EXISTS sent_notice_ids (
  user_id integer NOT NULL,
  notice_id varchar(128) NOT NULL,
  sent_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notice_id)
);