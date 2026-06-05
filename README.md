# 🚀 Gestion de Formation – Excellent Training · Green Building

Application full-stack de gestion des formations, avec un back-end Spring Boot (Java) et un front-end React.

---

## 📖 Introduction

Cette plateforme permet de gérer l’ensemble du cycle de vie des formations :  
catalogue des formations, gestion des participants, formateurs (internes/externes), structures, employeurs, profils, utilisateurs et rôles.  

Elle inclut également un tableau de bord statistique (nombre de formations par année, répartition par profil, etc.).

### 🛠️ Technologies utilisées
- **Back-end** : Spring Boot 3.5.13, Spring Data JPA, Spring Security, MySQL  
- **Front-end** : React 19 (create-react-app)  
- **Base de données** : MySQL 8  

---

## ⚙️ Prérequis

Avant de lancer l’application, assurez-vous d’avoir installé :

- Java 17 ou 21 (le projet utilise Java 21)
- Maven (ou utilisez le wrapper `mvnw`)
- Node.js (v18 ou plus) et npm
- MySQL Server (version 8 recommandée)
- Un IDE (IntelliJ IDEA, VS Code, Eclipse…)

---

## 🗄️ Configuration de la base de données

### 1. Démarrer MySQL

Lancez le service MySQL.

### 2. Créer la base de données (optionnel)

```sql
CREATE DATABASE gestion_formation;
```

### 3. Configurer `application.properties`

Fichier : `src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_formation?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE_MYSQL

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8888
```

⚠️ Remplacez `VOTRE_MOT_DE_PASSE_MYSQL` par votre mot de passe MySQL.

---

## 🧩 Configuration du backend – Port & CORS

- Le backend fonctionne par défaut sur le port **8888**
- La configuration CORS est déjà gérée dans `SecurityConfig.java`
- Les requêtes depuis `http://localhost:3000` sont autorisées

---

## 🌐 Configuration du frontend – Proxy (recommandé)

Ajoutez dans `frontend/package.json` :

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:8888"
}
```

💡 Alternative : changer le port backend en `8080` :

```properties
server.port=8080
```

---

## 🚀 Lancement de l’application

### 1. Backend (Spring Boot)

Dans un terminal à la racine du projet :

```bash
./mvnw spring-boot:run
```

Ou exécutez la classe :
GestionFormationApplication.java

✅ Vérification :

Tomcat started on port(s): 8888 (http)

---

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

🌍 Accès :  
http://localhost:3000

---

## 📊 Données de démonstration

La classe `DataInitializer` remplit automatiquement la base de données avec des données de test si la table `role` est vide.

---

## ❓ Problèmes fréquents et solutions

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| Access denied for user 'root'@'localhost' | Mauvais mot de passe MySQL | Vérifier `spring.datasource.password` |
| Backend inaccessible | Mauvais port (8080 vs 8888) | Ajouter proxy ou changer `server.port` |
| Erreurs JPA après déplacement | Cache IntelliJ corrompu | Supprimer `.idea` et `.iml`, réimporter |
| Port 8888 déjà utilisé | Conflit de port | Changer port (ex: 8889) |

---

## 📁 Structure du projet

gestion-formation/
├── src/main/java/com/isi/gestion_formation/
│   ├── config/
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   ├── service/
│   └── GestionFormationApplication.java
├── src/main/resources/
│   └── application.properties
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── pom.xml

---

## 👥 Auteurs

Projet réalisé dans le cadre du module Mini-projet BD et POO – 2ème semestre 2025-2026.  
Basé sur l’environnement Excellent Training – Green Building.

---

## 📄 Licence

Projet à usage pédagogique. Libre de le modifier et de le distribuer.
