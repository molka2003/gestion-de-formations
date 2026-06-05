package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Profil;
import com.isi.gestion_formation.repository.ProfilRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/profils")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProfilController {

    private final ProfilRepository profilRepository;

    @GetMapping
    public List<Profil> getAll() {
        return profilRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profil> getById(@PathVariable Long id) {
        return profilRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Profil create(@Valid @RequestBody Profil profil) {
        return profilRepository.save(profil);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profil> update(@PathVariable Long id, @Valid @RequestBody Profil profil) {
        return profilRepository.findById(id).map(existing -> {
            existing.setLibelle(profil.getLibelle());
            return ResponseEntity.ok(profilRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        profilRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}