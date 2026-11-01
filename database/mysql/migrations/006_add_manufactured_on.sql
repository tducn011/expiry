-- Migration 006: Add manufactured_on to food_entries (Issue #209)
ALTER TABLE food_entries
  ADD COLUMN manufactured_on DATE NULL AFTER opened_on,
  ADD CONSTRAINT entries_manufactured_on_date CHECK (manufactured_on IS NULL OR (expiry_date IS NULL OR manufactured_on <= expiry_date)),
  ADD INDEX entries_owner_manufactured (user_id, deleted_at, manufactured_on);
