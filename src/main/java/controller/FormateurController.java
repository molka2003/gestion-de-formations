package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Formateur;
import com.isi.gestion_formation.repository.FormateurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class FormateurController {

    private final FormateurRepository formateurRepository;

    @GetMapping
    public List<Formateur> getAll() {
        return formateurRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formateur> getById(@PathVariable Long id) {
        return formateurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Formateur create(@Valid @RequestBody Formateur formateur) {
        return formateurRepository.save(formateur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formateur> update(@PathVariable Long id, @Valid @RequestBody Formateur formateur) {
        return formateurRepository.findById(id).map(existing -> {
            existing.setNom(formateur.getNom());
            existing.setPrenom(formateur.getPrenom());
            existing.setEmail(formateur.getEmail());
            existing.setTel(formateur.getTel());
            existing.setType(formateur.getType());
            existing.setEmployeur(formateur.getEmployeur());
            return ResponseEntity.ok(formateurRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}