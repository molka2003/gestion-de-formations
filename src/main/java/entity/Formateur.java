package com.isi.gestion_formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "formateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Prénom obligatoire")
    private String prenom;

    @Email(message = "Email invalide")
    private String email;

    private String tel;

    // "INTERNE" ou "EXTERNE"
    private String type;

    @ManyToOne
    @JoinColumn(name = "id_employeur")
    private Employeur employeur;
}