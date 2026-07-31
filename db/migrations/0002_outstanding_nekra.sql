CREATE TYPE "public"."order_type" AS ENUM('product', 'course');--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'sepay_qr';--> statement-breakpoint
CREATE TABLE "course_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_ref" text NOT NULL,
	"certificate_code" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_certificates_certificate_code_unique" UNIQUE("certificate_code")
);
--> statement-breakpoint
CREATE TABLE "sepay_webhook_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" uuid,
	"transfer_amount" numeric(12, 0) NOT NULL,
	"content" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD COLUMN "order_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_type" "order_type" DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "course_ref" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sepay_webhook_logs" ADD CONSTRAINT "sepay_webhook_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_code_unique" UNIQUE("order_code");