
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `api_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_requests` (
  `user_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `idempotency_key` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `operation` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `request_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `response_status` int DEFAULT NULL,
  `response_body` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_id`,`idempotency_key`),
  CONSTRAINT `requests_owner` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `requests_completion` CHECK ((((`response_status` is null) and (`response_body` is null)) or ((`response_status` is not null) and (`response_body` is not null)))),
  CONSTRAINT `requests_hash` CHECK (regexp_like(`request_hash`,_latin1'^[0-9a-f]{64}$',_latin1'c')),
  CONSTRAINT `requests_key` CHECK (regexp_like(`idempotency_key`,_latin1'^[A-Za-z0-9_-]{8,100}$',_latin1'c')),
  CONSTRAINT `requests_operation` CHECK ((char_length(trim(`operation`)) > 0)),
  CONSTRAINT `requests_status` CHECK (((`response_status` is null) or (`response_status` between 200 and 299)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `food_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_entries` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `user_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name` varchar(200) NOT NULL,
  `storage_location` varchar(100) NOT NULL DEFAULT 'unspecified',
  `remaining_quantity` decimal(12,3) NOT NULL,
  `unit` varchar(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `date_certainty` varchar(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unknown',
  `date_source` varchar(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unknown',
  `date_label_type` varchar(15) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unspecified',
  `opened_on` date DEFAULT NULL,
  `note` text,
  `version` int NOT NULL DEFAULT '1',
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `entries_owner_visible` (`user_id`,`deleted_at`,`expiry_date`,`id`),
  KEY `entries_owner_quantity` (`user_id`,`deleted_at`,`remaining_quantity`,`id`),
  KEY `entries_owner_trash` (`user_id`,`deleted_at` DESC,`id`),
  CONSTRAINT `entries_owner` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `entries_certainty` CHECK ((`date_certainty` in (_latin1'known',_latin1'estimated',_latin1'unknown'))),
  CONSTRAINT `entries_date_state` CHECK ((((`date_certainty` = _latin1'unknown') and (`expiry_date` is null) and (`date_source` = _latin1'unknown') and (`date_label_type` = _latin1'unspecified')) or ((`date_certainty` = _latin1'estimated') and (`expiry_date` is not null) and (`date_source` = _latin1'user_estimate')) or ((`date_certainty` = _latin1'known') and (`expiry_date` is not null) and (`date_source` in (_latin1'printed_label',_latin1'user_entered'))))),
  CONSTRAINT `entries_label` CHECK ((`date_label_type` in (_latin1'use_by',_latin1'best_before',_latin1'unspecified'))),
  CONSTRAINT `entries_location` CHECK ((char_length(trim(`storage_location`)) > 0)),
  CONSTRAINT `entries_name` CHECK ((char_length(trim(`name`)) > 0)),
  CONSTRAINT `entries_note` CHECK (((`note` is null) or (char_length(`note`) <= 1000))),
  CONSTRAINT `entries_piece` CHECK (((`unit` <> _latin1'piece') or (`remaining_quantity` = floor(`remaining_quantity`)))),
  CONSTRAINT `entries_quantity` CHECK ((`remaining_quantity` >= 0)),
  CONSTRAINT `entries_source` CHECK ((`date_source` in (_latin1'printed_label',_latin1'user_entered',_latin1'user_estimate',_latin1'unknown'))),
  CONSTRAINT `entries_unit` CHECK ((`unit` in (_latin1'piece',_latin1'g',_latin1'ml'))),
  CONSTRAINT `entries_version` CHECK ((`version` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `version` int NOT NULL,
  `sha256` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `applied_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `entry_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `kind` varchar(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `quantity_before` decimal(12,3) NOT NULL,
  `quantity_after` decimal(12,3) NOT NULL,
  `reason` text,
  `recorded_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `initial_entry_id` char(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS ((case when (`kind` = _ascii'initial') then `entry_id` else NULL end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `one_initial_per_entry` (`initial_entry_id`),
  KEY `movements_entry_history` (`entry_id`,`recorded_at` DESC,`id`),
  CONSTRAINT `movements_entry` FOREIGN KEY (`entry_id`) REFERENCES `food_entries` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `movements_after` CHECK ((`quantity_after` >= 0)),
  CONSTRAINT `movements_before` CHECK ((`quantity_before` >= 0)),
  CONSTRAINT `movements_kind` CHECK ((`kind` in (_latin1'initial',_latin1'consume',_latin1'discard',_latin1'adjustment'))),
  CONSTRAINT `movements_reason` CHECK (((`reason` is null) or (char_length(`reason`) <= 500))),
  CONSTRAINT `movements_shape` CHECK ((((`kind` = _latin1'initial') and (`quantity_before` = 0) and (`quantity_after` > 0)) or ((`kind` in (_latin1'consume',_latin1'discard')) and (`quantity_after` < `quantity_before`)) or ((`kind` = _latin1'adjustment') and (`quantity_after` <> `quantity_before`) and (`reason` is not null) and (char_length(trim(`reason`)) > 0))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `identity_subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `timezone` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `attention_lead_days` int NOT NULL DEFAULT '2',
  `version` int NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_identity` (`identity_subject`),
  CONSTRAINT `users_display` CHECK ((char_length(trim(`display_name`)) between 1 and 100)),
  CONSTRAINT `users_lead` CHECK ((`attention_lead_days` between 0 and 30)),
  CONSTRAINT `users_timezone` CHECK ((char_length(trim(`timezone`)) between 1 and 100)),
  CONSTRAINT `users_version` CHECK ((`version` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

