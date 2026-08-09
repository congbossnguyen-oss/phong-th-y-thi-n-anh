CREATE TABLE "consultation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"topic" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
