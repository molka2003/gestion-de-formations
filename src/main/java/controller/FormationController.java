package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Formation;
import com.isi.gestion_formation.entity.Participant;
import com.isi.gestion_formation.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public List<Formation> getAll() {
        return formationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.findById(id));
    }

    @GetMapping("/annee/{annee}")
    public List<Formation> getByAnnee(@PathVariable Integer annee) {
        return formationService.findByAnnee(annee);
    }

    @PostMapping
    public Formation create(@Valid @RequestBody Formation formation) {
        return formationService.save(formation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> update(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        formation.setId(id);
        return ResponseEntity.ok(formationService.save(formation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formationId}/participants/{participantId}")
    public ResponseEntity<?> ajouterParticipant(
            @PathVariable Long formationId,
            @PathVariable Long participantId) {
        try {
            Participant p = formationService.ajouterParticipant(formationId, participantId);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{formationId}/participants/{participantId}")
    public ResponseEntity<?> retirerParticipant(
            @PathVariable Long formationId,
            @PathVariable Long participantId) {
        try {
            formationService.retirerParticipant(formationId, participantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}