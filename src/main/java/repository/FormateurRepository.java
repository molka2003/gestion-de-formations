// FormateurRepository.java
package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FormateurRepository extends JpaRepository<Formateur, Long> {}