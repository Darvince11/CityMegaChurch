ALTER TABLE "camp_beds" ADD COLUMN IF NOT EXISTS "price_pesewas" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY camp_id ORDER BY created_at, id) AS position
  FROM camp_beds
)
UPDATE camp_beds AS bed SET
  room = CASE ranked.position WHEN 1 THEN 'Villa' WHEN 2 THEN 'Hostel' WHEN 3 THEN 'Dormitory' ELSE bed.room END,
  label = CASE ranked.position WHEN 1 THEN 'Private comfort' WHEN 2 THEN 'Shared room' WHEN 3 THEN 'Community stay' ELSE bed.label END,
  capacity = CASE ranked.position WHEN 1 THEN 20 WHEN 2 THEN 60 WHEN 3 THEN 120 ELSE bed.capacity END,
  price_pesewas = CASE ranked.position WHEN 1 THEN 80000 WHEN 2 THEN 40000 WHEN 3 THEN 20000 ELSE bed.price_pesewas END
FROM ranked WHERE bed.id = ranked.id AND ranked.position <= 3;
--> statement-breakpoint
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY camp_id ORDER BY created_at, id) AS position
  FROM camp_beds
)
DELETE FROM camp_beds AS bed USING ranked
WHERE bed.id = ranked.id AND ranked.position > 3
AND NOT EXISTS (SELECT 1 FROM camp_bookings booking WHERE booking.bed_id = bed.id);
