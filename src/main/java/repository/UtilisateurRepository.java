package com.isi.gestion_formation.repository;

import com.isi.gestion_formation.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Recherche par login (déjà existant)
    Optional<Utilisateur> findByLogin(String login);

    // ✅ NOUVEAU : Recherche par email pour l'authentification
    Optional<Utilisateur> findByEmail(String email);
}
