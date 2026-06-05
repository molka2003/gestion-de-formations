package com.isi.gestion_formation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String tel;
    private Long structureId;
    private String structureLibelle;
    private Long profilId;
    private String profilLibelle;
    private int formationCount;
}