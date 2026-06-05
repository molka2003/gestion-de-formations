package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.service.StatistiqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    @GetMapping("/formations-par-annee")
    public Map<Integer, Long> formationsParAnnee() {
        return statistiqueService.formationsParAnnee();
    }

    @GetMapping("/participants-par-annee")
    public Map<Integer, Long> participantsParAnnee() {
        return statistiqueService.participantsParAnnee();
    }

    @GetMapping("/repartition-profil")
    public Map<String, Long> repartitionParProfil() {
        return statistiqueService.repartitionParProfil();
    }

    // Nouvel endpoint : nombre total de participants distincts
    @GetMapping("/total-participants")
    public long totalParticipantsDistinct() {
        return statistiqueService.getTotalParticipantsDistinct();
    }
}