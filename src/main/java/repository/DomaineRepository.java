package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Domaine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface DomaineRepository extends JpaRepository<Domaine, Long> {
    Optional<Domaine> findByLibelle(String libelle);
    boolean existsByLibelle(String libelle);
}
