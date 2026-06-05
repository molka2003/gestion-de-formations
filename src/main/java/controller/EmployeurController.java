package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Employeur;
import com.isi.gestion_formation.repository.EmployeurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employeurs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EmployeurController {

    private final EmployeurRepository employeurRepository;

    @GetMapping
    public List<Employeur> getAll() {
        return employeurRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employeur> getById(@PathVariable Long id) {
        return employeurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employeur create(@Valid @RequestBody Employeur employeur) {
        return employeurRepository.save(employeur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employeur> update(@PathVariable Long id, @Valid @RequestBody Employeur employeur) {
        return employeurRepository.findById(id).map(existing -> {
            existing.setNomEmployeur(employeur.getNomEmployeur());
            return ResponseEntity.ok(employeurRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}