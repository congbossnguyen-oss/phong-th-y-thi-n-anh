ALTER TABLE "orders" ADD COLUMN "promo_code_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "promo_discount_amount" numeric(12, 0);