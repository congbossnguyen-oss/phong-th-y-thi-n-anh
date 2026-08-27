CREATE TABLE "quan_su_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thang_nam" text NOT NULL,
	"so_luot_da_dung" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quan_su_usage" ADD CONSTRAINT "quan_su_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quan_su_usage_user_thang_idx" ON "quan_su_usage" USING btree ("user_id","thang_nam");