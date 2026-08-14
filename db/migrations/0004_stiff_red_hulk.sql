ALTER TYPE "public"."order_type" ADD VALUE 'tool';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tool_slug" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tool_input_snapshot" text;