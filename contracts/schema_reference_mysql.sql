-- MySQL 8.4 candidate schema. Each CREATE TABLE has an implicit DDL commit.
-- Migration runner records version + checksum only after the entire file succeeds.
CREATE TABLE users (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  identity_subject VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  timezone VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  attention_lead_days INT NOT NULL DEFAULT 2,
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT users_identity UNIQUE (identity_subject),
  CONSTRAINT users_display CHECK (CHAR_LENGTH(TRIM(display_name)) BETWEEN 1 AND 100),
  CONSTRAINT users_timezone CHECK (CHAR_LENGTH(TRIM(timezone)) BETWEEN 1 AND 100),
  CONSTRAINT users_lead CHECK (attention_lead_days BETWEEN 0 AND 30),
  CONSTRAINT users_version CHECK (version >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE food_entries (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(200) NOT NULL,
  storage_location VARCHAR(100) NOT NULL DEFAULT 'unspecified',
  remaining_quantity DECIMAL(12,3) NOT NULL,
  unit VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expiry_date DATE NULL,
  date_certainty VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unknown',
  date_source VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unknown',
  date_label_type VARCHAR(15) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unspecified',
  opened_on DATE NULL,
  note TEXT NULL,
  version INT NOT NULL DEFAULT 1,
  deleted_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT entries_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT entries_name CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT entries_location CHECK (CHAR_LENGTH(TRIM(storage_location)) > 0),
  CONSTRAINT entries_quantity CHECK (remaining_quantity >= 0),
  CONSTRAINT entries_unit CHECK (unit IN ('piece','g','ml')),
  CONSTRAINT entries_piece CHECK (unit <> 'piece' OR remaining_quantity = FLOOR(remaining_quantity)),
  CONSTRAINT entries_certainty CHECK (date_certainty IN ('known','estimated','unknown')),
  CONSTRAINT entries_source CHECK (date_source IN ('printed_label','user_entered','user_estimate','unknown')),
  CONSTRAINT entries_label CHECK (date_label_type IN ('use_by','best_before','unspecified')),
  CONSTRAINT entries_date_state CHECK (
    (date_certainty='unknown' AND expiry_date IS NULL AND date_source='unknown' AND date_label_type='unspecified')
    OR (date_certainty='estimated' AND expiry_date IS NOT NULL AND date_source='user_estimate')
    OR (date_certainty='known' AND expiry_date IS NOT NULL AND date_source IN ('printed_label','user_entered'))
  ),
  CONSTRAINT entries_note CHECK (note IS NULL OR CHAR_LENGTH(note) <= 1000),
  CONSTRAINT entries_version CHECK (version >= 1),
  INDEX entries_owner_visible (user_id, deleted_at, expiry_date, id),
  INDEX entries_owner_quantity (user_id, deleted_at, remaining_quantity, id),
  INDEX entries_owner_trash (user_id, deleted_at DESC, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE stock_movements (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  entry_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  kind VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  quantity_before DECIMAL(12,3) NOT NULL,
  quantity_after DECIMAL(12,3) NOT NULL,
  reason TEXT NULL,
  recorded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  initial_entry_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin
    GENERATED ALWAYS AS (CASE WHEN kind='initial' THEN entry_id ELSE NULL END) STORED,
  CONSTRAINT movements_entry FOREIGN KEY (entry_id) REFERENCES food_entries(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT movements_kind CHECK (kind IN ('initial','consume','discard','adjustment')),
  CONSTRAINT movements_before CHECK (quantity_before >= 0),
  CONSTRAINT movements_after CHECK (quantity_after >= 0),
  CONSTRAINT movements_reason CHECK (reason IS NULL OR CHAR_LENGTH(reason) <= 500),
  CONSTRAINT movements_shape CHECK (
    (kind='initial' AND quantity_before=0 AND quantity_after>0)
    OR (kind IN ('consume','discard') AND quantity_after<quantity_before)
    OR (kind='adjustment' AND quantity_after<>quantity_before AND reason IS NOT NULL AND CHAR_LENGTH(TRIM(reason))>0)
  ),
  CONSTRAINT one_initial_per_entry UNIQUE (initial_entry_id),
  INDEX movements_entry_history (entry_id, recorded_at DESC, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE api_requests (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  idempotency_key VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  operation VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  response_status INT NULL,
  response_body JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id,idempotency_key),
  CONSTRAINT requests_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT requests_key CHECK (REGEXP_LIKE(idempotency_key, '^[A-Za-z0-9_-]{8,100}$', 'c')),
  CONSTRAINT requests_hash CHECK (REGEXP_LIKE(request_hash, '^[0-9a-f]{64}$', 'c')),
  CONSTRAINT requests_operation CHECK (CHAR_LENGTH(TRIM(operation)) > 0),
  CONSTRAINT requests_status CHECK (response_status IS NULL OR response_status BETWEEN 200 AND 299),
  CONSTRAINT requests_completion CHECK (
    (response_status IS NULL AND response_body IS NULL)
    OR (response_status IS NOT NULL AND response_body IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
