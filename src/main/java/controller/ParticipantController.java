package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.dto.ParticipantDTO;
import com.isi.gestion_formation.entity.Participant;
import com.isi.gestion_formation.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    // Endpoint modifié pour retourner les DTO avec formationCount
    @GetMapping
    public List<ParticipantDTO> getAll() {
        return participantService.getAllWithFormationCount();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Participant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(participantService.findById(id));
    }

    @PostMapping
    public Participant create(@Valid @RequestBody Participant participant) {
        return participantService.save(participant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Participant> update(@PathVariable Long id, @Valid @RequestBody Participant participant) {
        participant.setId(id);
        return ResponseEntity.ok(participantService.save(participant));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        participantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}