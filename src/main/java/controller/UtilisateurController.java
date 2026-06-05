package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Utilisateur;
import com.isi.gestion_formation.repository.UtilisateurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping
    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> getById(@PathVariable Long id) {
        return utilisateurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Utilisateur utilisateur) {
        // Check unique login
        if (utilisateurRepository.findByLogin(utilisateur.getLogin()).isPresent()) {
            return ResponseEntity.badRequest().body("login_exists");
        }
        // Encode password
        utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        return ResponseEntity.ok(utilisateurRepository.save(utilisateur));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.findById(id).map(existing -> {
            existing.setLogin(utilisateur.getLogin());
            existing.setRole(utilisateur.getRole());
            // Only update password if provided (non-blank)
            if (utilisateur.getPassword() != null && !utilisateur.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
            }
            return ResponseEntity.ok(utilisateurRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        utilisateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
