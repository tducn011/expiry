-- Migration 004: Add barcode support to food_entries
ALTER TABLE food_entries
  ADD COLUMN barcode VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER note,
  ADD COLUMN barcode_format VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER barcode,
  ADD CONSTRAINT entries_barcode_shape CHECK (barcode IS NULL OR CHAR_LENGTH(TRIM(barcode)) > 0),
  ADD CONSTRAINT entries_barcode_format CHECK (barcode_format IS NULL OR barcode_format IN ('EAN_13','EAN_8','CODE_128','CODE_39','ITF','QR_CODE','DATA_MATRIX','PDF_417','AZTEC','other')),
  ADD CONSTRAINT entries_barcode_coherence CHECK ((barcode IS NULL AND barcode_format IS NULL) OR (barcode IS NOT NULL)),
  ADD INDEX entries_owner_barcode (user_id, deleted_at, barcode);
