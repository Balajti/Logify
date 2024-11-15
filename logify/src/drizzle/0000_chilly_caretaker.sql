CREATE TABLE IF NOT EXISTS "test_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
