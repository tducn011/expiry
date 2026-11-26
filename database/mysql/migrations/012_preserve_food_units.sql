-- The migration runner's mysql CLI session defaults to latin1 unless specified.
SET NAMES utf8mb4;

-- Preserve the unit labels currently offered by FoodForm. Existing values and
-- quantities are untouched; piece remains the legacy whole-count unit.
ALTER TABLE food_entries
  MODIFY unit VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  DROP CHECK entries_unit,
  DROP CHECK entries_piece,
  ADD CONSTRAINT entries_unit CHECK (unit IN ('piece','cái','hộp','gói','chai','quả','bó','kg','g','lít','ml')),
  ADD CONSTRAINT entries_piece CHECK (unit <> 'piece' OR remaining_quantity = FLOOR(remaining_quantity));
