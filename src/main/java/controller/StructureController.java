package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Structure;
import com.isi.gestion_formation.repository.StructureRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/structures")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StructureController {

    private final StructureRepository structureRepository;

    @GetMapping
    public List<Structure> getAll() {
        return structureRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Structure> getById(@PathVariable Long id) {
        return structureRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Structure create(@Valid @RequestBody Structure structure) {
        return structureRepository.save(structure);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Structure> update(@PathVariable Long id, @Valid @RequestBody Structure structure) {
        return structureRepository.findById(id).map(existing -> {
            existing.setLibelle(structure.getLibelle());
            return ResponseEntity.ok(structureRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        structureRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}