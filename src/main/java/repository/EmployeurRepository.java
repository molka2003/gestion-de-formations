// EmployeurRepository.java
package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeurRepository extends JpaRepository<Employeur, Long> {}