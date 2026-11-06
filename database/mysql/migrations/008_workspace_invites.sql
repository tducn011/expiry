-- Migration 008: Workspace invitation tokens and role assignment (Issue #216)
CREATE TABLE IF NOT EXISTS workspace_invites (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  workspace_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token_hash VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  role ENUM('manager', 'staff') NOT NULL DEFAULT 'staff',
  expires_at TIMESTAMP(6) NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  uses_count INT NOT NULL DEFAULT 0,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_invite_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_invite_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_invite_lookup (token_hash, revoked, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
