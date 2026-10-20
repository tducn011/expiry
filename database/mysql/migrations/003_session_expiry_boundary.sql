-- Preserve migration002's recorded checksum while allowing the final activity
-- timestamp to equal the absolute session expiry boundary.
ALTER TABLE user_sessions
  DROP CHECK sessions_time,
  ADD CONSTRAINT sessions_time CHECK (last_seen_at>=created_at AND last_seen_at<=expires_at AND expires_at>created_at);
