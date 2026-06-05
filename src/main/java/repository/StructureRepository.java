// StructureRepository.java
package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Structure;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StructureRepository extends JpaRepository<Structure, Long> {}