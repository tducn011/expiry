-- Migration 009: Product catalog and inventory batches (Issue #217)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  barcode VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  barcode_format VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL,
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NULL,
  category VARCHAR(30) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'other',
  default_unit ENUM('piece','g','ml') NOT NULL DEFAULT 'piece',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_products_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS inventory_batches (
  id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  workspace_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  product_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  user_id VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lot_number VARCHAR(64) NULL,
  manufactured_on DATE NULL,
  expiry_date DATE NULL,
  quantity DECIMAL(12, 3) NOT NULL,
  unit ENUM('piece','g','ml') NOT NULL,
  storage_location VARCHAR(100) NOT NULL DEFAULT 'unspecified',
  status ENUM('active', 'depleted', 'expired', 'discarded') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_batch_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_batch_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_batch_fefo_expiry (expiry_date ASC),
  INDEX idx_batch_product (product_id),
  INDEX idx_batch_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
