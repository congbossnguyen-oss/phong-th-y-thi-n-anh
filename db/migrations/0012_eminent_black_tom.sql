CREATE TABLE "van_khi_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dai_van_index" integer NOT NULL,
	"luu_nien_json" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "van_khi_cache" ADD CONSTRAINT "van_khi_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "van_khi_cache_user_dai_van_idx" ON "van_khi_cache" USING btree ("user_id","dai_van_index");