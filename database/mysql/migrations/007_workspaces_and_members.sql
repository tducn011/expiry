-- Migration 007: Workspaces and workspace membership (Issue #215)
CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type ENUM('personal', 'restaurant', 'business') NOT NULL DEFAULT 'personal',
  owner_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_workspace_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_workspace_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  role ENUM('owner', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  joined_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT fk_member_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE food_entries
  ADD COLUMN workspace_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER user_id,
  ADD CONSTRAINT fk_food_entries_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL,
  ADD INDEX idx_food_entries_workspace (workspace_id, deleted_at);
