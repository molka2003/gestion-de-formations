package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Domaine;
import com.isi.gestion_formation.repository.DomaineRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/domaines")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class DomaineController {

    private final DomaineRepository domaineRepository;

    @GetMapping
    public List<Domaine> getAll() {
        return domaineRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Domaine> getById(@PathVariable Long id) {
        return domaineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Domaine create(@Valid @RequestBody Domaine domaine) {
        return domaineRepository.save(domaine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Domaine> update(@PathVariable Long id, @Valid @RequestBody Domaine domaine) {
        return domaineRepository.findById(id).map(existing -> {
            existing.setLibelle(domaine.getLibelle());
            return ResponseEntity.ok(domaineRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        domaineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}