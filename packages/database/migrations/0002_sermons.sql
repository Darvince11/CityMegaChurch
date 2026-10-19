CREATE TABLE "sermons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(180) NOT NULL,
  "speaker" varchar(120) NOT NULL,
  "summary" text NOT NULL,
  "video_url" text,
  "preached_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
