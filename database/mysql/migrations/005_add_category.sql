-- Migration 005: Add category to food_entries
ALTER TABLE food_entries
  ADD COLUMN category VARCHAR(30) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'other' AFTER storage_location,
  ADD CONSTRAINT entries_category CHECK (category IN ('fresh_produce','meat_seafood','dairy_eggs','prepared_food','dry_pantry','beverage','other')),
  ADD INDEX entries_owner_category (user_id, deleted_at, category);
