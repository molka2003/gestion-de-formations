package com.isi.gestion_formation.config;

import com.isi.gestion_formation.entity.*;
import com.isi.gestion_formation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository        roleRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final DomaineRepository     domaineRepo;
    private final ProfilRepository      profilRepo;
    private final StructureRepository   structureRepo;
    private final EmployeurRepository   employeurRepo;
    private final FormateurRepository   formateurRepo;
    private final FormationRepository   formationRepo;
    private final ParticipantRepository participantRepo;

    /** Sauvegarde un domaine seulement s'il n'existe pas encore (evite les doublons). */
    private Domaine saveDomaine(String libelle) {
        return domaineRepo.findByLibelle(libelle)
                .orElseGet(() -> domaineRepo.save(new Domaine(null, libelle)));
    }

    /** Sauvegarde une formation seulement si (titre + annee) est unique. */
    private Optional<Formation> saveFormation(Formation f) {
        if (formationRepo.existsByTitreAndAnnee(f.getTitre(), f.getAnnee())) return Optional.empty();
        return Optional.of(formationRepo.save(f));
    }

    @Override
    public void run(String... args) {

        if (utilisateurRepo.count() > 0) {
            System.out.println("Base deja initialisee - DataInitializer ignore.");
            return;
        }

        System.out.println("Initialisation des donnees de demonstration...");

        // ── 1. ROLES ──────────────────────────────────────────────────────────
        Role roleAdmin = roleRepo.save(new Role(null, "ADMIN"));
        Role roleResp  = roleRepo.save(new Role(null, "RESPONSABLE"));
        Role roleUser  = roleRepo.save(new Role(null, "UTILISATEUR"));

        // ── 2. UTILISATEURS ───────────────────────────────────────────────────
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        utilisateurRepo.save(new Utilisateur(null, "admin",        "admin@greenbuilding.tn",        enc.encode("GreenB@Admin2026#"), roleAdmin));
        utilisateurRepo.save(new Utilisateur(null, "responsable",  "responsable@greenbuilding.tn",  enc.encode("GreenB@Resp2026#"),  roleResp));
        utilisateurRepo.save(new Utilisateur(null, "utilisateur",  "utilisateur@greenbuilding.tn",  enc.encode("GreenB@User2026#"),  roleUser));

        // ── 3. DOMAINES (8 uniques, contrainte unique en base) ────────────────
        Domaine dInfo = saveDomaine("Informatique et Numerique");
        Domaine dFin  = saveDomaine("Finance et Comptabilite");
        Domaine dMgt  = saveDomaine("Management et Leadership");
        Domaine dRH   = saveDomaine("Ressources Humaines");
        Domaine dMec  = saveDomaine("Mecanique et Maintenance");
        Domaine dJur  = saveDomaine("Juridique et Conformite");
        Domaine dQSE  = saveDomaine("Qualite, Securite et Environnement");
        Domaine dLng  = saveDomaine("Langues et Communication");
        List<Domaine> domaines = List.of(dInfo, dFin, dMgt, dRH, dMec, dJur, dQSE, dLng);

        // ── 4. PROFILS ────────────────────────────────────────────────────────
        Profil pInfo5  = profilRepo.save(new Profil(null, "Informaticien Bac+5"));
        Profil pInfo3  = profilRepo.save(new Profil(null, "Informaticien Bac+3"));
        Profil pGest   = profilRepo.save(new Profil(null, "Gestionnaire"));
        Profil pJur    = profilRepo.save(new Profil(null, "Juriste"));
        Profil pTech   = profilRepo.save(new Profil(null, "Technicien Superieur"));
        Profil pCompt  = profilRepo.save(new Profil(null, "Comptable"));
        Profil pIngMec = profilRepo.save(new Profil(null, "Ingenieur Mecanique"));
        Profil pDRH    = profilRepo.save(new Profil(null, "Responsable RH"));
        List<Profil> profils = List.of(pInfo5, pInfo3, pGest, pJur, pTech, pCompt, pIngMec, pDRH);

        // ── 5. STRUCTURES ─────────────────────────────────────────────────────
        Structure sDC       = structureRepo.save(new Structure(null, "Direction Centrale"));
        Structure sDRTunis  = structureRepo.save(new Structure(null, "Direction Regionale Tunis"));
        Structure sDRSfax   = structureRepo.save(new Structure(null, "Direction Regionale Sfax"));
        Structure sDRSousse = structureRepo.save(new Structure(null, "Direction Regionale Sousse"));
        Structure sDRBizerte= structureRepo.save(new Structure(null, "Direction Regionale Bizerte"));
        Structure sDSI      = structureRepo.save(new Structure(null, "Direction des Systemes d'Information"));
        Structure sDRH      = structureRepo.save(new Structure(null, "Direction des Ressources Humaines"));
        Structure sDF       = structureRepo.save(new Structure(null, "Direction Financiere"));
        List<Structure> structures = List.of(sDC, sDRTunis, sDRSfax, sDRSousse, sDRBizerte, sDSI, sDRH, sDF);

        // ── 6. EMPLOYEURS ─────────────────────────────────────────────────────
        Employeur eGB      = employeurRepo.save(new Employeur(null, "Green Building"));
        Employeur eMSFT    = employeurRepo.save(new Employeur(null, "Microsoft Tunisie"));
        Employeur eOracle  = employeurRepo.save(new Employeur(null, "Oracle Consulting"));
        Employeur eUTM     = employeurRepo.save(new Employeur(null, "Universite de Tunis El Manar"));
        Employeur eISI     = employeurRepo.save(new Employeur(null, "ISI Tunis"));
        Employeur eCabinet = employeurRepo.save(new Employeur(null, "Cabinet Conseil RH Plus"));
        Employeur eISOCert = employeurRepo.save(new Employeur(null, "ISO Cert Maghreb"));
        List<Employeur> employeurs = List.of(eGB, eMSFT, eOracle, eUTM, eISI, eCabinet, eISOCert);

        // ── 7. FORMATEURS (30 total, tous noms uniques) ───────────────────────
        List<Formateur> formateurs = new ArrayList<>();

        // 10 formateurs fixes
        formateurs.add(formateurRepo.save(new Formateur(null, "Ben Salah",  "Karim",    "k.bensalah@greenbuilding.tn",  "+216 71 234 567", "INTERNE", eGB)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Haouari",    "Sonia",    "s.haouari@greenbuilding.tn",   "+216 71 234 568", "INTERNE", eGB)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Gharbi",     "Mehdi",    "m.gharbi@microsoft.tn",        "+216 71 345 678", "EXTERNE", eMSFT)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Ammar",      "Youssef",  "y.ammar@oracle.com",           "+216 71 456 789", "EXTERNE", eOracle)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Hlaoui",     "Nadia",    "n.hlaoui@utm.tn",              "+216 71 567 890", "EXTERNE", eUTM)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Hamdi",      "Slim",     "s.hamdi@isi.rnu.tn",           "+216 71 678 901", "EXTERNE", eISI)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Hamzaoui",   "Fatma",    "f.hamzaoui@cabinetRH.tn",      "+216 71 789 012", "EXTERNE", eCabinet)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Hichri",     "Hassen",   "h.hichri@isocert.tn",          "+216 71 890 123", "EXTERNE", eISOCert)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Chaabane",   "Ines",     "i.chaabane@greenbuilding.tn",  "+216 71 234 999", "INTERNE", eGB)));
        formateurs.add(formateurRepo.save(new Formateur(null, "Bchir",      "Bilel",    "b.bchir@greenbuilding.tn",     "+216 71 234 888", "INTERNE", eGB)));

        // 20 formateurs supplementaires (noms tous distincts des participants)
        String[][] fSupp = {
            {"Martin",   "Jean",        "EXTERNE", "1"}, {"Durand",   "Pierre",      "EXTERNE", "2"},
            {"Lefevre",  "Paul",        "INTERNE", "3"}, {"Moreau",   "Jacques",     "EXTERNE", "4"},
            {"Simon",    "Andre",       "INTERNE", "5"}, {"Laurent",  "Louis",       "EXTERNE", "6"},
            {"Michel",   "Charles",     "INTERNE", "0"}, {"Garcia",   "Robert",      "EXTERNE", "1"},
            {"David",    "Henri",       "INTERNE", "2"}, {"Bertrand", "Francois",    "EXTERNE", "3"},
            {"Roux",     "Bernard",     "INTERNE", "4"}, {"Vincent",  "Philippe",    "EXTERNE", "5"},
            {"Fournier", "Nicolas",     "INTERNE", "6"}, {"Morel",    "Sebastien",   "EXTERNE", "0"},
            {"Girard",   "Thierry",     "INTERNE", "1"}, {"Leroy",    "Patrick",     "EXTERNE", "2"},
            {"Mercier",  "Christophe",  "INTERNE", "3"}, {"Blanc",    "Alexandre",   "EXTERNE", "4"},
            {"Garnier",  "Julien",      "INTERNE", "5"}, {"Perrin",   "Eric",        "EXTERNE", "6"}
        };
        for (int i = 0; i < fSupp.length; i++) {
            Employeur emp = employeurs.get(Integer.parseInt(fSupp[i][3]) % employeurs.size());
            formateurs.add(formateurRepo.save(new Formateur(null,
                    fSupp[i][0], fSupp[i][1],
                    fSupp[i][0].toLowerCase() + "." + fSupp[i][1].toLowerCase() + "@formateur.tn",
                    "+216 99 " + String.format("%03d", i) + " " + String.format("%03d", i * 7 % 1000),
                    fSupp[i][2], emp)));
        }
        System.out.println("  " + formateurs.size() + " formateurs crees.");

        // ── 8. FORMATIONS ────────────────────────────────────────────────────
        // Budgets en chiffres ronds (en DT)
        int[] budgets = {1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800,
                         3000, 3200, 3500, 3800, 4000, 4200, 4500, 4800,
                         5000, 5200, 5500, 6000};

        List<Formation> formations = new ArrayList<>();

        // 24 formations fixes (titres entierement uniques, budgets ronds)
        Object[][] fixes = {
            {"Developpement Java EE Avance",              2022, 5,  4500, dInfo, 5},
            {"Gestion Financiere et Budgetaire",          2022, 3,  3200, dFin,  1},
            {"Leadership et Management d'equipe",         2022, 2,  2800, dMgt,  6},
            {"Maintenance Industrielle Preventive",       2022, 4,  3800, dMec,  0},
            {"Cybersecurite et Protection des donnees",   2023, 5,  5200, dInfo, 2},
            {"Comptabilite IFRS",                         2023, 3,  3500, dFin,  1},
            {"Droit du Travail Tunisien",                 2023, 2,  2500, dJur,  4},
            {"Certification ISO 9001",                    2023, 4,  4200, dQSE,  7},
            {"Gestion des Ressources Humaines",           2023, 3,  3000, dRH,   6},
            {"Spring Boot et Microservices",              2024, 5,  5500, dInfo, 5},
            {"Power BI et Tableaux de Bord",              2024, 3,  3800, dInfo, 2},
            {"Controle de Gestion Avance",                2024, 4,  4000, dFin,  1},
            {"Communication et Prise de parole",          2024, 2,  2200, dLng,  8},
            {"Securite au Travail et Gestes d'urgence",   2024, 2,  1800, dQSE,  7},
            {"Gestion de Projet Agile Scrum",             2024, 3,  3500, dMgt,  3},
            {"Intelligence Artificielle et Machine Learning", 2025, 5, 6000, dInfo, 2},
            {"Angular et TypeScript Moderne",             2025, 4,  4800, dInfo, 5},
            {"Audit Interne ISO 19011",                   2025, 3,  3800, dQSE,  7},
            {"Anglais Professionnel B2",                  2025, 10, 2800, dLng,  8},
            {"Cloud Computing et Azure",                  2025, 5,  5800, dInfo, 2},
            {"Recrutement et Marque Employeur",           2025, 2,  2400, dRH,   6},
            {"DevOps et CICD avec Docker",                2026, 5,  5800, dInfo, 3},
            {"Transformation Digitale en Entreprise",     2026, 3,  4200, dMgt,  9},
            {"Fiscalite des Entreprises",                 2026, 3,  3800, dFin,  4}
        };

        for (Object[] row : fixes) {
            String titre    = (String)  row[0];
            int    annee    = (int)     row[1];
            int    duree    = (int)     row[2];
            double budget   = ((Number) row[3]).doubleValue();
            Domaine dom     = (Domaine) row[4];
            int    fIdx     = (int)     row[5];
            saveFormation(new Formation(null, titre, annee, duree, budget, dom, formateurs.get(fIdx), List.of()))
                    .ifPresent(formations::add);
        }

        // 50 formations generees (10 par annee, tous titres distincts dans l'annee)
        // Chaque annee a ses 10 titres specifiques → 0 doublon possible
        String[][] titresParAnnee = {
            // 2022
            {"Python pour la data science",        "React et interfaces modernes",
             "Docker et orchestration cloud",       "Node.js back-end",
             "GraphQL et API moderne",              "Strategie d'entreprise",
             "Negociation et techniques de vente",  "Gestion du stress professionnel",
             "Team building et cohesion",           "Comptabilite approfondie"},
            // 2023
            {"Analyse financiere avancee",         "Gestion de la paie",
             "Droit des societes tunisien",         "Marketing digital",
             "Communication interne efficace",      "Cybersecurite avancee",
             "Blockchain et applications",          "Big Data et Hadoop",
             "Machine Learning applique",           "Data Engineering"},
            // 2024
            {"DevSecOps et integration continue",   "Vue.js et ecosysteme front-end",
             "Kubernetes en production",            "TypeScript avance",
             "REST API et bonnes pratiques",        "Lean Management",
             "Gestion du changement organisationnel","Coaching et feedback",
             "Fiscalite internationale",            "Audit et controle interne"},
            // 2025
            {"Generative AI et LLM",               "Flutter et applications mobiles",
             "Microservices et resilience",         "Securite des systemes embarques",
             "Power Platform Microsoft",            "Gestion de crise et continuite",
             "RGPD et protection des donnees",      "Supply chain et logistique",
             "Finance comportementale",             "Management interculturel"},
            // 2026
            {"Quantum computing pour ingenieurs",   "Edge computing et IoT",
             "Architecture zero-trust",             "FinTech et innovation financiere",
             "Green IT et numerique responsable",   "RH digitale et people analytics",
             "Leadership en periode de crise",      "Normes IFRS 17 et 9",
             "Intelligence emotionnelle au travail","Mediation et resolution de conflits"}
        };

        int[] annees = {2022, 2023, 2024, 2025, 2026};
        int budgetIdx = 0;
        for (int a = 0; a < annees.length; a++) {
            int annee = annees[a];
            for (int i = 0; i < titresParAnnee[a].length; i++) {
                String  titre    = titresParAnnee[a][i];
                Domaine dom      = domaines.get((a + i) % domaines.size());
                Formateur form   = formateurs.get((a * 3 + i * 2) % formateurs.size());
                int     duree    = 2 + (i % 7);
                double  budget   = budgets[budgetIdx % budgets.length];
                budgetIdx++;
                saveFormation(new Formation(null, titre, annee, duree, budget, dom, form, List.of()))
                        .ifPresent(formations::add);
            }
        }
        System.out.println("  " + formations.size() + " formations creees.");

        // ── 9. PARTICIPANTS (200 total, tous noms uniques) ────────────────────
        List<Participant> participants = new ArrayList<>();

        // 20 participants fixes (noms distincts des 30 formateurs)
        Object[][] partFixes = {
            {"Ben Amor",  "Ahmed",   "a.benamor@greenbuilding.tn",   "+216 55 100 001", sDC,       pInfo5},
            {"Trabelsi",  "Mariem",  "m.trabelsi@greenbuilding.tn",  "+216 55 100 002", sDRTunis,  pGest},
            {"Saadi",     "Khaled",  "k.saadi@greenbuilding.tn",     "+216 55 100 003", sDRSfax,   pTech},
            {"Mansouri",  "Ines",    "i.mansouri@greenbuilding.tn",  "+216 55 100 004", sDC,       pCompt},
            {"Bouzid",    "Tarek",   "t.bouzid@greenbuilding.tn",    "+216 55 100 005", sDSI,      pInfo3},
            {"Oueslati",  "Sarra",   "s.oueslati@greenbuilding.tn",  "+216 55 100 006", sDRH,      pDRH},
            {"Hamrouni",  "Mohamed", "m.hamrouni@greenbuilding.tn",  "+216 55 100 007", sDRSousse, pIngMec},
            {"Khelifi",   "Rania",   "r.khelifi@greenbuilding.tn",   "+216 55 100 008", sDF,       pCompt},
            {"Mbarki",    "Oussama", "o.mbarki@greenbuilding.tn",    "+216 55 100 009", sDC,       pJur},
            {"Ayadi",     "Nesrine", "n.ayadi@greenbuilding.tn",     "+216 55 100 010", sDRBizerte,pGest},
            {"Chakroun",  "Farouk",  "f.chakroun@greenbuilding.tn",  "+216 55 100 011", sDSI,      pInfo5},
            {"Zouari",    "Leila",   "l.zouari@greenbuilding.tn",    "+216 55 100 012", sDRH,      pDRH},
            {"Tlili",     "Anis",    "a.tlili@greenbuilding.tn",     "+216 55 100 013", sDRSfax,   pTech},
            {"Boussetta", "Hajer",   "h.boussetta@greenbuilding.tn", "+216 55 100 014", sDF,       pGest},
            {"Ferchichi", "Walid",   "w.ferchichi@greenbuilding.tn", "+216 55 100 015", sDC,       pInfo5},
            {"Ghariani",  "Soumaya", "s.ghariani@greenbuilding.tn",  "+216 55 100 016", sDRTunis,  pCompt},
            {"Mejri",     "Yassine", "y.mejri@greenbuilding.tn",     "+216 55 100 017", sDSI,      pInfo3},
            {"Nasri",     "Donia",   "d.nasri@greenbuilding.tn",     "+216 55 100 018", sDRSousse, pJur},
            {"Rezgui",    "Bassem",  "b.rezgui@greenbuilding.tn",    "+216 55 100 019", sDRBizerte,pIngMec},
            {"Laabidi",   "Amira",   "a.laabidi@greenbuilding.tn",   "+216 55 100 020", sDC,       pDRH}
        };
        for (Object[] row : partFixes) {
            participants.add(participantRepo.save(new Participant(null,
                    (String) row[0], (String) row[1], (String) row[2], (String) row[3],
                    (Structure) row[4], (Profil) row[5], new ArrayList<>())));
        }

        // 180 participants supplementaires (noms entierement uniques)
        String[][] pSupp = {
            {"Belhaj","Omar"},       {"Chabbi","Fatma"},       {"Dhaoui","Sami"},         {"Elloumi","Nour"},
            {"Fakhfakh","Bilel"},    {"Ghannouchi","Asma"},    {"Ouali","Tarek"},          {"Idriss","Sonia"},
            {"Jaziri","Mourad"},     {"Khemiri","Lina"},       {"Labbane","Riadh"},        {"Mahjoub","Olfa"},
            {"Nouri","Hichem"},      {"Omri","Chiraz"},        {"Poulain","Karim"},        {"Qadri","Sara"},
            {"Rahmouni","Fares"},    {"Slama","Wafa"},         {"Tounsi","Rachid"},        {"Umaira","Hela"},
            {"Vali","Nabil"},        {"Werghemmi","Dorra"},    {"Salhi","Yacine"},         {"Yalaoui","Rim"},
            {"Zairi","Saif"},        {"Abdelli","Manel"},      {"Baccouche","Issam"},      {"Cellali","Samia"},
            {"Dridi","Foued"},       {"Echi","Lamia"},         {"Farhat","Raouf"},         {"Guiga","Sana"},
            {"Habib","Zied"},        {"Issaoui","Rawdha"},     {"Jendoubi","Lotfi"},       {"Kchaou","Imen"},
            {"Lajnef","Maher"},      {"Mnasri","Houda"},       {"Nabbous","Chokri"},       {"Ounalli","Mouna"},
            {"Perez","Sofiene"},     {"Qasmi","Nihed"},        {"Rjab","Wassim"},          {"Sahloul","Anissa"},
            {"Tabka","Adnene"},      {"Ubaidi","Sameh"},       {"Vrinat","Dorsaf"},        {"Wahbi","Amine"},
            {"Baraketi","Najla"},    {"Yahyaoui","Hassen"},    {"Zarouk","Ines"},          {"Abidi","Tarek"},
            {"Barka","Sonia"},       {"Chaouch","Mohamed"},    {"Daghfous","Rania"},       {"Elleuch","Slim"},
            {"Feriani","Wiem"},      {"Ghabri","Adel"},        {"Hmida","Sarra"},          {"Intissar","Khalil"},
            {"Jlassi","Sihem"},      {"Khiari","Bilel"},       {"Lakhal","Farah"},         {"Mzali","Yousra"},
            {"Najjar","Seifeddine"},{"Ouederni","Haifa"},      {"Beji","Bassem"},          {"Qoura","Maha"},
            {"Rzig","Sabrine"},      {"Selmi","Wissem"},       {"Tlijani","Nadia"},        {"Zribi","Chayma"},
            {"Bouraoui","Lotfi"},    {"Weslati","Faouzi"},     {"Jemai","Dorsaf"},         {"Yakoubi","Ridha"},
            {"Zbidi","Souhir"},      {"Arbi","Fedi"},          {"Boukari","Meriem"},       {"Cheniti","Anis"},
            {"Dagher","Lobna"},      {"Ennouri","Mehrez"},     {"Ferjani","Sana"},         {"Grira","Wael"},
            {"Hizem","Hela"},        {"Idoudi","Nejib"},       {"Jerbi","Myriam"},         {"Ksentini","Amel"},
            {"Limam","Haithem"},     {"Manoubi","Dhekra"},     {"Nasr","Hatem"},           {"Ouerfelli","Nira"},
            {"Belaid","Adel"},       {"Quispe","Marwa"},       {"Rouissi","Kais"},         {"Souayah","Ines"},
            {"Touati","Meher"},      {"Karray","Bilel"},       {"Veridis","Afef"},         {"Waked","Naoufel"},
            {"Masri","Semia"},       {"Yousfi","Chedi"},       {"Zitoun","Nadia"},         {"Alouini","Omar"},
            {"Bhouri","Imen"},       {"Chouikha","Skander"},   {"Daldoul","Sirine"},       {"Ennaceur","Kais"},
            {"Farjallah","Yara"},    {"Gaaloul","Hedi"},       {"Hermassi","Wajdi"},       {"Rekik","Nora"},
            {"Jbali","Abdou"},       {"Karoui","Maissa"},      {"Louati","Sofiane"},       {"Medini","Thouraya"},
            {"Neji","Habib"},        {"Othmani","Ranya"},      {"Panara","Zied"},          {"Ouerghi","Fatma"},
            {"Rhaiem","Anouar"},     {"Sekma","Wafa"},         {"Turki","Ghassan"},        {"Belhadj","Ines"},
            {"Ventura","Sami"},      {"Wannes","Olfa"},        {"Sghaier","Nouri"},        {"Yaakoubi","Slim"},
            {"Zaabar","Ameni"},      {"Achour","Rachid"},      {"Bouzaiene","Cyrine"},     {"Chebbi","Raouf"},
            {"Douma","Wided"},       {"Essid","Firas"},        {"Frikha","Mariem"},        {"Ghazouani","Anas"},
            {"Hamada","Saloua"},     {"Iguider","Sabri"},      {"Jelassi","Malak"},        {"Kasdallah","Wissam"},
            {"Lamouri","Khawla"},    {"Mouelhi","Malek"},      {"Nefzi","Hamdi"},          {"Ouni","Sarra"},
            {"Pina","Riadh"},        {"Quadri","Lilia"},       {"Rziga","Foued"},          {"Siala","Amira"},
            {"Tabbabi","Montassar"},{"Umari","Dalila"},        {"Boughanmi","Aymen"},      {"Wali","Emna"},
            {"Stambouli","Jamil"},   {"Yazidi","Zeineb"},      {"Zarrouk","Haythem"},      {"Aziz","Raoudha"},
            {"Bouali","Majdi"},      {"Chamakhi","Soumaya"},   {"Debez","Mounir"},         {"Elyass","Kalthoum"},
            {"Fendri","Ramzi"},      {"Guermazi","Nour"},      {"Hachfi","Bechir"},        {"Ibrahim","Wiem"},
            {"Jouini","Rached"},     {"Kessentini","Selima"},  {"Laroussi","Wael"},        {"Masmoudi","Sonia"},
            {"Naija","Oussama"},     {"Ouerghemmi","Rym"},     {"Hnida","Mahdi"},          {"Saidani","Selim"}
        };
        for (int i = 0; i < Math.min(180, pSupp.length); i++) {
            String nom    = pSupp[i][0];
            String prenom = pSupp[i][1];
            String email  = nom.toLowerCase().replaceAll("[^a-z]","") + "."
                          + prenom.toLowerCase().replaceAll("[^a-z]","") + "@greenbuilding.tn";
            String tel    = "+216 55 " + String.format("%03d", (i + 200) / 1000)
                          + " " + String.format("%03d", (i + 200) % 1000);
            participants.add(participantRepo.save(new Participant(null, nom, prenom, email, tel,
                    structures.get(i % structures.size()),
                    profils.get(i % profils.size()),
                    new ArrayList<>())));
        }
        System.out.println("  " + participants.size() + " participants crees.");

        // ── 10. INSCRIPTIONS (1 a 4 formations par participant) ───────────────
        Random rand = new Random(42); // graine fixe = resultats reproductibles
        List<Formation> allFormations = formationRepo.findAll();
        for (Participant p : participants) {
            List<Formation> shuffled = new ArrayList<>(allFormations);
            Collections.shuffle(shuffled, rand);
            int nb = 1 + rand.nextInt(4);
            List<Formation> pForms = p.getFormations();
            for (int i = 0; i < nb && i < shuffled.size(); i++) {
                Formation f = shuffled.get(i);
                if (!pForms.contains(f)) pForms.add(f);
            }
            participantRepo.save(p);
        }

        System.out.println("Initialisation terminee : "
                + participants.size() + " participants, "
                + formations.size() + " formations, "
                + formateurs.size() + " formateurs.");
    }
}
