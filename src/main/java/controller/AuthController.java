package com.isi.gestion_formation.controller;

import com.isi.gestion_formation.entity.Utilisateur;
import com.isi.gestion_formation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Endpoint d'authentification par email + mot de passe.
 * Remplace la vérification hardcodée côté frontend.
 *
 * POST /api/auth/login
 * Body : { "email": "...", "password": "..." }
 * Retour succès  : { "login": "...", "email": "...", "role": "ADMIN|RESPONSABLE|UTILISATEUR", "display": "..." }
 * Retour échec   : 401 Unauthorized
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String email    = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");

        // Validation basique
        if (email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email et mot de passe requis"));
        }

        // Recherche de l'utilisateur par email
        Optional<Utilisateur> optUser = utilisateurRepository.findByEmail(email);

        if (optUser.isEmpty()) {
            // Délai volontaire pour limiter les attaques par timing
            try { Thread.sleep(300); } catch (InterruptedException ignored) {}
            return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects"));
        }

        Utilisateur user = optUser.get();

        // Vérification du mot de passe (BCrypt)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            try { Thread.sleep(300); } catch (InterruptedException ignored) {}
            return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects"));
        }

        // Nom d'affichage selon le rôle
        String roleName = user.getRole() != null ? user.getRole().getNom() : "UTILISATEUR";
        String display  = switch (roleName) {
            case "ADMIN"       -> "Administrateur";
            case "RESPONSABLE" -> "Responsable Centre";
            default            -> "Utilisateur";
        };

        // Retour des informations sans le mot de passe
        return ResponseEntity.ok(Map.of(
                "login",   user.getLogin(),
                "email",   user.getEmail(),
                "role",    roleName,
                "display", display
        ));
    }
}
