-- ============================================================
--  SCRIPT DE RÉINITIALISATION - gestion_formation
--  Exécuter dans MySQL Workbench ou en ligne de commande :
--    mysql -u root -p < reinitialiser_bd.sql
-- ============================================================

-- Désactiver les contraintes de clé étrangère le temps du nettoyage
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer et recréer la base
DROP DATABASE IF EXISTS gestion_formation;
CREATE DATABASE gestion_formation
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_formation;

-- Réactiver les contraintes
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Les tables seront créées automatiquement par Hibernate
-- au démarrage de l'application (ddl-auto=update)
-- Les données de démo seront insérées par DataInitializer
-- ============================================================
SELECT 'Base gestion_formation réinitialisée avec succès !' AS message;
