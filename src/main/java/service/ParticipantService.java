package com.isi.gestion_formation.service;

import com.isi.gestion_formation.dto.ParticipantDTO;
import com.isi.gestion_formation.entity.Participant;
import com.isi.gestion_formation.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public List<Participant> findAll() {
        return participantRepository.findAll();
    }

    public Participant findById(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant non trouvé"));
    }

    public Participant save(Participant participant) {
        return participantRepository.save(participant);
    }

    public void delete(Long id) {
        participantRepository.deleteById(id);
    }

    // Stats : nombre de participants par année
    public long countByAnnee(Integer annee) {
        return participantRepository.countParticipantsByAnnee(annee);
    }

    // Stats : répartition par profil (pour graphique camembert)
    public Map<String, Long> repartitionParProfil() {
        Map<String, Long> result = new HashMap<>();
        participantRepository.countByProfil()
                .forEach(row -> result.put((String) row[0], (Long) row[1]));
        return result;
    }

    // Nouvelle méthode : retourne tous les participants avec leur nombre de formations
    @Transactional(readOnly = true)   // évite les problèmes de lazy loading
    public List<ParticipantDTO> getAllWithFormationCount() {
        List<Participant> participants = participantRepository.findAll();
        List<ParticipantDTO> dtos = new ArrayList<>();
        for (Participant p : participants) {
            ParticipantDTO dto = new ParticipantDTO();
            dto.setId(p.getId());
            dto.setNom(p.getNom());
            dto.setPrenom(p.getPrenom());
            dto.setEmail(p.getEmail());
            dto.setTel(p.getTel());
            dto.setStructureLibelle(p.getStructure() != null ? p.getStructure().getLibelle() : "");
            dto.setProfilLibelle(p.getProfil() != null ? p.getProfil().getLibelle() : "");
            dto.setFormationCount(p.getFormations().size());  // charge la collection
            dtos.add(dto);
        }
        return dtos;
    }
}