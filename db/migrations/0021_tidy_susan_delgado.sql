CREATE TABLE "chiem_tinh_lich_su" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"calculation_id" text NOT NULL,
	"dau_vao" jsonb NOT NULL,
	"ket_qua" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chiem_tinh_lich_su" ADD CONSTRAINT "chiem_tinh_lich_su_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;