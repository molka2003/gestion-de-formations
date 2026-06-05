// RoleRepository.java
package com.isi.gestion_formation.repository;
import com.isi.gestion_formation.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoleRepository extends JpaRepository<Role, Long> {}