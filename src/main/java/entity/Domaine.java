package com.isi.gestion_formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "domaine", uniqueConstraints = @UniqueConstraint(columnNames = "libelle"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Domaine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Libellé obligatoire")
    @Column(unique = true, nullable = false)
    private String libelle;
}
