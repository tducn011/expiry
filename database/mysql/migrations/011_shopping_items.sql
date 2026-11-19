-- Shopping list items belong to one authenticated user. JSON stores optional UI metadata.
CREATE TABLE shopping_items (
  id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  payload JSON NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY shopping_owner_created (user_id, created_at),
  CONSTRAINT shopping_items_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT shopping_items_version_ck CHECK (version >= 1)
) ENGINE=InnoDB;
