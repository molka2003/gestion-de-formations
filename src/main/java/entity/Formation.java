package com.isi.gestion_formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Titre obligatoire")
    private String titre;

    @NotNull(message = "Année obligatoire")
    private Integer annee;

    @NotNull(message = "Durée obligatoire")
    private Integer duree; // en jours

    private Double budget;

    @ManyToOne
    @JoinColumn(name = "id_domaine")
    private Domaine domaine;

    @ManyToOne
    @JoinColumn(name = "id_formateur")
    private Formateur formateur;

    @ManyToMany(mappedBy = "formations")
    private List<Participant> participants = new ArrayList<>();
}