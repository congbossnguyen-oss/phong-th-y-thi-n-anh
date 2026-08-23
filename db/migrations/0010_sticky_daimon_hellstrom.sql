CREATE TYPE "public"."gender" AS ENUM('Nam', 'Nữ');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_day" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_month" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_hour" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "gender";