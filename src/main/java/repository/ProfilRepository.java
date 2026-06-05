// ProfilRepository.java
package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProfilRepository extends JpaRepository<Profil, Long> {}