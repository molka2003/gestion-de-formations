package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByAnnee(Integer annee);
    List<Formation> findByDomaineId(Long domaineId);
    Optional<Formation> findByTitreAndAnnee(String titre, Integer annee);
    boolean existsByTitreAndAnnee(String titre, Integer annee);

    @Query("SELECT COUNT(f) FROM Formation f WHERE f.annee = :annee")
    long countByAnnee(int annee);
}
