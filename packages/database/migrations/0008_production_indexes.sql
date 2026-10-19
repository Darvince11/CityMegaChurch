CREATE INDEX IF NOT EXISTS "sessions_user_active_idx" ON "sessions" ("user_id", "expires_at") WHERE "revoked_at" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "camp_beds_camp_idx" ON "camp_beds" ("camp_id", "room");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "camps_status_start_idx" ON "camps" ("status", "starts_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "camp_bookings_user_created_idx" ON "camp_bookings" ("user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "camp_bookings_status_created_idx" ON "camp_bookings" ("status", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "camp_bookings_bed_idx" ON "camp_bookings" ("bed_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_published_idx" ON "announcements" ("published_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_updates_date_idx" ON "service_updates" ("service_date" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sermons_preached_idx" ON "sermons" ("preached_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gallery_photos_created_idx" ON "gallery_photos" ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_idx" ON "audit_logs" ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_user_created_idx" ON "audit_logs" ("user_id", "created_at" DESC);
