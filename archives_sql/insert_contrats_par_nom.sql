-- Script SQL pour insérer des contrats fictifs en utilisant les NOMS des entreprises
-- Ce script trouve automatiquement les IDs par nom, évitant les erreurs de clé étrangère
-- Chaque contrat a une durée minimum de 6 mois, des montants différents et des descriptions fictives
-- Utilise INSERT IGNORE pour ignorer les contrats qui existent déjà (évite les erreurs de duplication)

-- IMPORTANT: Si un nom ne correspond pas exactement, ajuste-le dans la sous-requête SELECT
-- Les contrats existants seront ignorés silencieusement grâce à INSERT IGNORE

-- Contrat 1 - JoyAtWork
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'JoyAtWork' LIMIT 1),
    'CONTRACT-2024-001', 'Enterprise', 'Actif',
    '2024-01-15', '2025-01-15', '2024-01-10', '2025-01-15',
    150000.00, 12500.00, 'EUR',
    'Contrat Enterprise pour JoyAtWork. Programme complet de bien-être au travail avec accès à toutes les plateformes, coaching personnalisé et suivi mensuel avec rapports détaillés.',
    'Renouvellement automatique si non résilié 30 jours avant échéance. Support prioritaire 24/7 inclus.',
    300,
    NOW(), NOW()
);

-- Contrat 2 - MindfulCorp
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'MindfulCorp' LIMIT 1),
    'CONTRACT-2024-002', 'Premium', 'Actif',
    '2024-02-20', '2024-12-20', '2024-02-18', '2024-12-20',
    95000.00, 7916.67, 'EUR',
    'Contrat Premium pour MindfulCorp. Programme de pleine conscience et bien-être mental. Ateliers mensuels de méditation, consultations individuelles, et accès à la plateforme de suivi.',
    'Possibilité d étendre la couverture à 250 employés avec avenant. Formation des managers incluse.',
    200,
    NOW(), NOW()
);

-- Contrat 3 - JoyAtWork France
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'JoyAtWork France' LIMIT 1),
    'CONTRACT-2024-003', 'Enterprise', 'Actif',
    '2024-03-10', '2025-03-10', '2024-03-08', '2025-03-10',
    135000.00, 11250.00, 'EUR',
    'Contrat Enterprise pour JoyAtWork France. Solutions de bien-être adaptées au marché français. Programme complet incluant ergonomie, prévention des TMS, et gestion du stress.',
    'Interventions sur site mensuelles. Programme personnalisé selon les métiers.',
    280,
    NOW(), NOW()
);

-- Contrat 4 - joyat
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'joyat' LIMIT 1),
    'CONTRACT-2024-004', 'Standard', 'Actif',
    '2024-04-05', '2024-10-05', '2024-04-03', NULL,
    48000.00, 8000.00, 'EUR',
    'Contrat Standard de 6 mois pour joyat. Programme de bien-être digital. Accès à la plateforme digitale, webinaires mensuels, et ressources documentaires.',
    'Contrat pilote avec option de renouvellement. Évaluation à mi-parcours prévue.',
    120,
    NOW(), NOW()
);

-- Contrat 5 - Nouveau nom
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'Nouveau nom' LIMIT 1),
    'CONTRACT-2024-005', 'Premium', 'En négociation',
    '2024-06-01', '2025-06-01', NULL, NULL,
    88000.00, 7333.33, 'EUR',
    'Contrat Premium en cours de négociation. Programme de bien-être adapté aux besoins spécifiques. Focus sur la gestion du stress et l équilibre vie pro/perso.',
    'En attente de validation budgétaire. Proposition valable jusqu au 31 mai 2024.',
    150,
    NOW(), NOW()
);

-- Contrat 6 - TechCorp Solutions
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'TechCorp Solutions' LIMIT 1),
    'CONTRACT-2024-006', 'Enterprise', 'Actif',
    '2024-01-10', '2025-01-10', '2024-01-05', '2025-01-10',
    125000.00, 10416.67, 'EUR',
    'Contrat Enterprise pour TechCorp Solutions. Programme complet de bien-être au travail. Accès complet à toutes les plateformes, coaching personnalisé pour 250 employés, et suivi mensuel.',
    'Renouvellement automatique. Support prioritaire 24/7 inclus.',
    250,
    NOW(), NOW()
);

-- Contrat 7 - BioHealth Industries
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'BioHealth Industries' LIMIT 1),
    'CONTRACT-2024-007', 'Premium', 'Actif',
    '2024-02-15', '2025-02-15', '2024-02-12', '2025-02-15',
    110000.00, 9166.67, 'EUR',
    'Contrat Premium pour BioHealth Industries. Programme de santé et bien-être adapté au secteur biotechnologique. Ateliers de prévention, consultations individuelles, et suivi santé.',
    'Formation des équipes en présentiel. Support adapté aux horaires de recherche.',
    180,
    NOW(), NOW()
);

-- Contrat 8 - Green Energy Co
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'Green Energy Co' LIMIT 1),
    'CONTRACT-2024-008', 'Enterprise', 'Actif',
    '2024-04-05', '2025-04-05', '2024-04-01', '2025-04-05',
    180000.00, 15000.00, 'EUR',
    'Contrat Enterprise pour Green Energy Co. Programme complet pour 320 employés. Ergonomie, prévention des TMS, gestion du stress, et suivi médical préventif.',
    'Interventions sur site mensuelles. Programme personnalisé selon les métiers (bureaux et terrain).',
    320,
    NOW(), NOW()
);

-- Contrat 9 - FinanceFirst Group
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'FinanceFirst Group' LIMIT 1),
    'CONTRACT-2024-009', 'Enterprise', 'Actif',
    '2024-01-20', '2025-01-20', '2024-01-18', '2025-01-20',
    140000.00, 11666.67, 'EUR',
    'Contrat Enterprise annuel pour FinanceFirst Group. Programme de prévention du burn-out, gestion du stress en période de forte activité, et coaching individuel pour managers.',
    'Renouvellement automatique. Sessions de groupe et individuelles selon besoins.',
    210,
    NOW(), NOW()
);

-- Contrat 10 - EduTech Innovation
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'EduTech Innovation' LIMIT 1),
    'CONTRACT-2024-010', 'Standard', 'Actif',
    '2024-05-01', '2024-11-01', '2024-04-28', NULL,
    55000.00, 9166.67, 'EUR',
    'Contrat Standard de 6 mois pour EduTech Innovation. Programme de bien-être adapté aux enseignants et formateurs. Focus sur la voix, la posture, et la gestion de classe.',
    'Contrat renouvelable. Évaluation à 3 mois pour ajustements éventuels.',
    95,
    NOW(), NOW()
);

-- Contrat 11 - LogiTrans Global
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'LogiTrans Global' LIMIT 1),
    'CONTRACT-2024-011', 'Premium', 'Actif',
    '2024-03-15', '2024-12-15', '2024-03-12', NULL,
    105000.00, 11666.67, 'EUR',
    'Contrat Premium de 9 mois pour LogiTrans Global. Programme de prévention des accidents, ergonomie pour chauffeurs et manutentionnaires, et gestion de la fatigue.',
    'Contrat adapté aux horaires décalés. Interventions sur sites multiples possibles.',
    380,
    NOW(), NOW()
);

-- Contrat 12 - WellBeing Solutions
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'WellBeing Solutions' LIMIT 1),
    'CONTRACT-2024-012', 'Premium', 'Actif',
    '2024-04-10', '2025-04-10', '2024-04-08', '2025-04-10',
    115000.00, 9583.33, 'EUR',
    'Contrat Premium annuel pour WellBeing Solutions. Programme complet de bien-être. Ateliers mensuels, consultations individuelles, et accès à la plateforme de suivi.',
    'Formation des managers incluse. Support adapté aux besoins spécifiques.',
    220,
    NOW(), NOW()
);

-- Contrat 13 - Food & Care
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'Food & Care' LIMIT 1),
    'CONTRACT-2024-013', 'Premium', 'Actif',
    '2024-04-10', '2024-12-10', '2024-04-08', NULL,
    72000.00, 9000.00, 'EUR',
    'Contrat Premium de 8 mois pour Food & Care. Programme de prévention des TMS en cuisine, gestion de la chaleur, et bien-être des équipes en salle.',
    'Formation HACCP et bien-être combinées. Adapté aux horaires de restauration.',
    110,
    NOW(), NOW()
);

-- Contrat 14 - SecureIT Services
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'SecureIT Services' LIMIT 1),
    'CONTRACT-2024-014', 'Standard', 'Actif',
    '2024-03-01', '2024-09-01', '2024-02-28', NULL,
    62000.00, 10333.33, 'EUR',
    'Contrat Standard de 6 mois pour SecureIT Services. Programme de prévention des troubles visuels, gestion du stress des deadlines, et ergonomie des postes de travail.',
    'Contrat pilote. Évaluation à 3 mois pour extension éventuelle.',
    140,
    NOW(), NOW()
);

-- Contrat 15 - HealthyWork Labs
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'HealthyWork Labs' LIMIT 1),
    'CONTRACT-2024-015', 'Enterprise', 'Actif',
    '2024-02-01', '2025-02-01', '2024-01-28', '2025-02-01',
    130000.00, 10833.33, 'EUR',
    'Contrat Enterprise pour HealthyWork Labs. Programme de prévention de l épuisement professionnel, gestion du stress, et soutien psychologique.',
    'Interventions adaptées aux contraintes. Disponibilité 24/7 pour urgences.',
    195,
    NOW(), NOW()
);

-- Contrat 16 - UrbanMind Consulting
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'UrbanMind Consulting' LIMIT 1),
    'CONTRACT-2024-016', 'Premium', 'Actif',
    '2024-05-15', '2024-11-15', '2024-05-12', NULL,
    68000.00, 11333.33, 'EUR',
    'Contrat Premium de 6 mois pour UrbanMind Consulting. Programme de gestion du stress des consultants, équilibre vie pro/perso, et prévention du burn-out.',
    'Sessions individuelles et collectives. Support adapté aux déplacements fréquents.',
    125,
    NOW(), NOW()
);

-- Contrat 17 - blueocean-tech.com
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'blueocean-tech.com' LIMIT 1),
    'CONTRACT-2024-017', 'Standard', 'Actif',
    '2024-06-01', '2024-12-01', '2024-05-30', NULL,
    52000.00, 8666.67, 'EUR',
    'Contrat Standard de 6 mois pour blueocean-tech.com. Programme de bien-être digital. Accès à la plateforme, webinaires mensuels, et ressources documentaires.',
    'Contrat pilote avec option de renouvellement. Évaluation à mi-parcours.',
    100,
    NOW(), NOW()
);

-- Contrat 18 - mountaincare-group.fr
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'mountaincare-group.fr' LIMIT 1),
    'CONTRACT-2024-018', 'Premium', 'Actif',
    '2024-03-20', '2025-03-20', '2024-03-18', '2025-03-20',
    98000.00, 8166.67, 'EUR',
    'Contrat Premium annuel pour mountaincare-group.fr. Programme de santé et bien-être. Ateliers mensuels, consultations individuelles, et suivi santé.',
    'Formation des managers incluse. Support adapté aux besoins spécifiques.',
    160,
    NOW(), NOW()
);

-- Contrat 19 - cityhr-partners.fr
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'cityhr-partners.fr' LIMIT 1),
    'CONTRACT-2024-019', 'Standard', 'En attente signature',
    '2024-07-01', '2025-01-01', NULL, NULL,
    58000.00, 9666.67, 'EUR',
    'Contrat Standard de 6 mois pour cityhr-partners.fr. Programme de bien-être pour équipes RH. Gestion du stress, et équilibre vie pro/perso.',
    'En attente de signature. Démarrage prévu le 1er juillet 2024.',
    130,
    NOW(), NOW()
);

-- Contrat 20 - globalcare-alliance.org
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'globalcare-alliance.org' LIMIT 1),
    'CONTRACT-2024-020', 'Enterprise', 'Actif',
    '2024-01-05', '2025-01-05', '2024-01-02', '2025-01-05',
    165000.00, 13750.00, 'EUR',
    'Contrat Enterprise annuel pour globalcare-alliance.org. Programme complet de bien-être international. Accès à toutes les plateformes, coaching personnalisé, et suivi mensuel.',
    'Renouvellement automatique. Support multilingue 24/7 inclus.',
    350,
    NOW(), NOW()
);

-- Contrat supplémentaire - TechCorp Solutions (contrat expiré)
INSERT IGNORE INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'TechCorp Solutions' LIMIT 1),
    'CONTRACT-2023-045', 'Premium', 'Expiré',
    '2023-01-15', '2023-12-31', '2023-01-10', NULL,
    95000.00, 7916.67, 'EUR',
    'Contrat Premium précédent. Programme de bien-être digital et coaching. Renouvelé en 2024 avec upgrade Enterprise.',
    'Contrat expiré. Remplacé par CONTRACT-2024-006.',
    250,
    NOW(), NOW()
);

-- Contrat supplémentaire - Green Energy Co (contrat en négociation)
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    (SELECT id FROM entreprises WHERE name = 'Green Energy Co' LIMIT 1),
    'CONTRACT-2025-001', 'Enterprise', 'En négociation',
    '2025-04-05', '2026-04-05', NULL, NULL,
    200000.00, 16666.67, 'EUR',
    'Renouvellement et extension du contrat Enterprise. Extension de la couverture à 400 employés et ajout de nouveaux services de prévention.',
    'En cours de négociation pour renouvellement 2025. Proposition valable jusqu au 15 mars 2025.',
    400,
    NOW(), NOW()
);


