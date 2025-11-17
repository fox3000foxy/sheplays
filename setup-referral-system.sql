-- Script de création du système de parrainage
-- À exécuter avec: mysql -u sheplaysuser -p'Gu1lver0k%59' sheplays < setup-referral-system.sql

-- Table des codes de parrainage
-- Chaque client (user_id) a un code de parrainage unique
CREATE TABLE IF NOT EXISTS referral_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  referral_code VARCHAR(16) NOT NULL UNIQUE,
  created_at BIGINT NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_referral_code (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des parrainages
-- Lie un talent à son parrain (client)
CREATE TABLE IF NOT EXISTS referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  talent_discord_id VARCHAR(64) NOT NULL UNIQUE,
  referrer_user_id VARCHAR(64) NOT NULL,
  referral_code VARCHAR(16) NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_talent (talent_discord_id),
  INDEX idx_referrer (referrer_user_id),
  FOREIGN KEY (referral_code) REFERENCES referral_codes(referral_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter des colonnes pour indiquer si un talent a été parrainé
-- Note: MySQL ne supporte pas IF NOT EXISTS pour ALTER TABLE ADD COLUMN
-- On ignore les erreurs si les colonnes existent déjà

SET @dbname = DATABASE();
SET @tablename = 'talents';
SET @columnname1 = 'referred_by';
SET @columnname2 = 'referral_code_used';

SET @preparedStatement1 = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname1
  ) > 0,
  'SELECT ''Column referred_by already exists'' AS msg;',
  'ALTER TABLE talents ADD COLUMN referred_by VARCHAR(64) DEFAULT NULL;'
));
PREPARE alterIfNotExists1 FROM @preparedStatement1;
EXECUTE alterIfNotExists1;
DEALLOCATE PREPARE alterIfNotExists1;

SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname2
  ) > 0,
  'SELECT ''Column referral_code_used already exists'' AS msg;',
  'ALTER TABLE talents ADD COLUMN referral_code_used VARCHAR(16) DEFAULT NULL;'
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Ajouter l'index (ignorer si existe déjà)
SET @indexExists = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = @dbname
  AND table_name = @tablename
  AND index_name = 'idx_referred_by');

SET @indexStatement = IF(@indexExists > 0,
  'SELECT ''Index idx_referred_by already exists'' AS msg;',
  'CREATE INDEX idx_referred_by ON talents(referred_by);'
);
PREPARE createIndexIfNotExists FROM @indexStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SELECT 'Tables de parrainage créées avec succès!' AS status;
