-- Script SQL pour créer la table companies directement dans MySQL

USE mindful_journey;

-- Créer la table companies si elle n'existe pas
CREATE TABLE IF NOT EXISTS `companies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `sector` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `employees` INT NOT NULL DEFAULT 0,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL,
  `website` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `wellness_programs` JSON NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'En négociation',
  `contract_value` DECIMAL(10, 2) NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vérifier que la table existe
SELECT 'Table companies créée avec succès!' AS message;

