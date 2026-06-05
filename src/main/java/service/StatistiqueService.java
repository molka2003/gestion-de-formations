package com.isi.gestion_formation.service;

import com.isi.gestion_formation.repository.FormationRepository;
import com.isi.gestion_formation.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    private final FormationRepository formationRepository;
    private final ParticipantRepository participantRepository;

    // Évolution du nombre de formations par année
    public Map<Integer, Long> formationsParAnnee() {
        Map<Integer, Long> result = new LinkedHashMap<>();
        int currentYear = java.time.Year.now().getValue();
        for (int year = currentYear - 4; year <= currentYear; year++) {
            result.put(year, formationRepository.countByAnnee(year));
        }
        return result;
    }

    // Nombre de participants par année (inscriptions)
    public Map<Integer, Long> participantsParAnnee() {
        Map<Integer, Long> result = new LinkedHashMap<>();
        int currentYear = java.time.Year.now().getValue();
        for (int year = currentYear - 4; year <= currentYear; year++) {
            result.put(year, participantRepository.countParticipantsByAnnee(year));
        }
        return result;
    }

    // Répartition par profil
    public Map<String, Long> repartitionParProfil() {
        Map<String, Long> result = new HashMap<>();
        participantRepository.countByProfil()
                .forEach(row -> result.put((String) row[0], (Long) row[1]));
        return result;
    }

    // Nouvelle méthode : nombre total de participants distincts
    public long getTotalParticipantsDistinct() {
        return participantRepository.countDistinctParticipants();
    }
}