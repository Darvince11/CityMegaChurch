CREATE TABLE "camps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(160) NOT NULL,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "location" varchar(200) NOT NULL,
  "description" text NOT NULL,
  "status" varchar(20) DEFAULT 'open' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_beds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "camp_id" uuid NOT NULL,
  "label" varchar(120) NOT NULL,
  "room" varchar(120) NOT NULL,
  "capacity" integer DEFAULT 1 NOT NULL,
  "booked_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "camp_id" uuid NOT NULL,
  "bed_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "notes" text,
  "reviewed_by_id" uuid,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(160) NOT NULL,
  "body" text NOT NULL,
  "kind" varchar(30) DEFAULT 'general' NOT NULL,
  "published_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "service_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(160) NOT NULL,
  "pastor" varchar(120),
  "sermon_title" varchar(180),
  "summary" text NOT NULL,
  "image_url" text,
  "service_date" timestamp with time zone NOT NULL,
  "created_by_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "camp_beds" ADD CONSTRAINT "camp_beds_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD CONSTRAINT "camp_bookings_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD CONSTRAINT "camp_bookings_bed_id_camp_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."camp_beds"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD CONSTRAINT "camp_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD CONSTRAINT "camp_bookings_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "service_updates" ADD CONSTRAINT "service_updates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "camp_bookings_one_per_member" ON "camp_bookings" USING btree ("camp_id","user_id");
