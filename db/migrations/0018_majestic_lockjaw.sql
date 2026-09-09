CREATE TABLE "quan_su_lich_su_luan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"casting_method" text NOT NULL,
	"dau_vao" jsonb NOT NULL,
	"ket_qua" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quan_su_lich_su_luan" ADD CONSTRAINT "quan_su_lich_su_luan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;