ALTER TABLE "subscriptions" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "is_trial" boolean DEFAULT false NOT NULL;