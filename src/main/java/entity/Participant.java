package com.isi.gestion_formation.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "participant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "formations")
public class Participant {

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

    @ManyToOne
    @JoinColumn(name = "id_structure")
    private Structure structure;

    @ManyToOne
    @JoinColumn(name = "id_profil")
    private Profil profil;

    // MAX 4 formations par participant — vérifié dans le Service
    @ManyToMany
    @JoinTable(
            name = "participant_formation",
            joinColumns = @JoinColumn(name = "id_participant"),
            inverseJoinColumns = @JoinColumn(name = "id_formation")
    )
    @JsonIgnore  // ← AJOUTÉ pour éviter la boucle infinie lors de la sérialisation JSON
    private List<Formation> formations = new ArrayList<>();
}