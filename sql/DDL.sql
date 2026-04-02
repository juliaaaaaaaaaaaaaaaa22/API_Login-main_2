-- =============================================
-- Tabelas para sistema de voltas / corridas
-- Compatível com suas rotas de ranking em Node.js
-- =============================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema corridas_db
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `corridas_db`;
CREATE SCHEMA IF NOT EXISTS `corridas_db` DEFAULT CHARACTER SET utf8mb4;
USE `corridas_db`;

-- -----------------------------------------------------
-- Table `users` (já existia)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_users` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_users`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `corredores`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `corredores`;
CREATE TABLE IF NOT EXISTS `corredores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  `turma` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `voltas`  ←←← ESSA É A PRINCIPAL QUE VOCÊ PRECISA
-- -----------------------------------------------------
DROP TABLE IF EXISTS `voltas`;
CREATE TABLE `voltas` (
    `id_volta`          INT NOT NULL AUTO_INCREMENT,
    `id_corredor`       INT NOT NULL,
    `data_hora_inicio`  DATETIME(3) NOT NULL,        -- início da volta com milissegundos
    `data_hora_fim`     DATETIME(3) NULL,
    `tempo_volta_ms`    INT UNSIGNED NULL,           -- tempo final em milissegundos (usado nos rankings)
    `status`            ENUM('em_andamento', 'finalizada', 'cancelada') DEFAULT 'em_andamento',
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id_volta`),
    
    FOREIGN KEY (`id_corredor`) REFERENCES `corredores`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX `idx_corredor_status` (`id_corredor`, `status`),
    INDEX `idx_data_inicio` (`data_hora_inicio`),
    INDEX `idx_tempo_final` (`tempo_volta_ms`)
) ENGINE = InnoDB;

-- =============================================
-- Teste rápido após criar as tabelas
-- =============================================
-- SELECT * FROM voltas;
-- DESCRIBE voltas;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;