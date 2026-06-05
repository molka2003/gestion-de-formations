package com.isi.gestion_formation.repository;

import com.isi.gestion_formation.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    @Query("SELECT COUNT(p) FROM Participant p JOIN p.formations f WHERE f.annee = :annee")
    long countParticipantsByAnnee(Integer annee);

    @Query("SELECT p.profil.libelle, COUNT(p) FROM Participant p GROUP BY p.profil.libelle")
    List<Object[]> countByProfil();

    // Méthode ajoutée pour compter les participants distincts (sans doublon)
    @Query("SELECT COUNT(DISTINCT p) FROM Participant p")
    long countDistinctParticipants();
}