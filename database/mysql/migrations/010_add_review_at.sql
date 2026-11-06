-- Migration 010: Add review_at to food_entries for reminder/freshness review tracking
ALTER TABLE food_entries
  ADD COLUMN review_at DATE NULL AFTER manufactured_on,
  ADD INDEX entries_owner_review (user_id, deleted_at, review_at);
