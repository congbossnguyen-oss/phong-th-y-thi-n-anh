CREATE TYPE "public"."ai_video_job_status" AS ENUM('queued', 'submitted', 'processing', 'completed', 'downloading', 'ready', 'failed', 'cancelled', 'timeout', 'auth_error', 'rate_limit', 'provider_error', 'download_error');--> statement-breakpoint
CREATE TYPE "public"."ai_video_provider" AS ENUM('wan', 'ltx');--> statement-breakpoint
CREATE TABLE "ai_video_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"topic" text,
	"scene_index" integer,
	"scene_title" text,
	"scene_knowledge_ref" text,
	"provider" "ai_video_provider" NOT NULL,
	"model" text,
	"prompt" text NOT NULL,
	"negative_prompt" text,
	"duration_seconds" integer,
	"resolution" text,
	"aspect_ratio" text,
	"status" "ai_video_job_status" DEFAULT 'queued' NOT NULL,
	"external_job_id" text,
	"result_url" text,
	"error_message" text,
	"estimated_cost_usd" numeric(10, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_video_jobs" ADD CONSTRAINT "ai_video_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;