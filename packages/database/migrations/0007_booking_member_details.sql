ALTER TABLE "camp_bookings" ADD COLUMN IF NOT EXISTS "booking_name" varchar(120) DEFAULT 'Member' NOT NULL;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD COLUMN IF NOT EXISTS "booking_phone" varchar(20) DEFAULT '000000000' NOT NULL;
--> statement-breakpoint
ALTER TABLE "camp_bookings" ADD COLUMN IF NOT EXISTS "member_group" varchar(20) DEFAULT 'Group 1' NOT NULL;
--> statement-breakpoint
UPDATE camp_bookings AS booking
SET booking_name = member.full_name,
    booking_phone = COALESCE(member.phone, '000000000')
FROM users AS member
WHERE booking.user_id = member.id AND booking.booking_name = 'Member';
