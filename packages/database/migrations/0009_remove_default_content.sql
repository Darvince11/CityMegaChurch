DELETE FROM camps AS camp
WHERE camp.title = 'City Mega Church Encounter Camp'
  AND camp.location = 'Venue details shared after registration'
  AND camp.description = 'A focused weekend of worship, teaching, rest, and connection for the City Mega Church family.'
  AND camp.starts_at = '2026-11-20 15:00:00+00'
  AND camp.ends_at = '2026-11-23 10:00:00+00'
  AND NOT EXISTS (
    SELECT 1 FROM camp_bookings AS booking WHERE booking.camp_id = camp.id
  );
