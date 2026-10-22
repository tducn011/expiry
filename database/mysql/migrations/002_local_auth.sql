-- PROPOSAL ONLY: user approval is required before applying this migration.
-- User selected Node-managed email/password and durable server sessions on 2026-10-11.
-- Additive only: no edits to users/food_entries/stock_movements/api_requests or existing data.
-- MySQL DDL implicitly commits. Do not claim transactional rollback for partial DDL.
CREATE TABLE local_credentials (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  email_normalized VARCHAR(254) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  password_verifier VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT credentials_email UNIQUE (email_normalized),
  CONSTRAINT credentials_email_shape CHECK (CHAR_LENGTH(email_normalized) BETWEEN 3 AND 254 AND email_normalized=LOWER(email_normalized)),
  CONSTRAINT credentials_verifier CHECK (REGEXP_LIKE(password_verifier, '^scrypt[$]131072[$]8[$]1[$][0-9a-f]{32}[$][0-9a-f]{128}$', 'c'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_sessions (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL,
  last_seen_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  CONSTRAINT sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT sessions_hash CHECK (REGEXP_LIKE(token_hash, '^[0-9a-f]{64}$', 'c')),
  CONSTRAINT sessions_time CHECK (last_seen_at>=created_at AND last_seen_at<expires_at AND expires_at>created_at),
  CONSTRAINT sessions_revocation CHECK (revoked_at IS NULL OR revoked_at>=created_at),
  INDEX sessions_owner (user_id,revoked_at,expires_at),
  INDEX sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
