-- Script SQL pour insérer des contrats fictifs correspondant aux 15 entreprises
-- Ce script utilise directement les IDs des entreprises (plus fiable que les noms)
-- Assure-toi que les entreprises ont été insérées dans l'ordre et ont les IDs 1 à 15

-- IMPORTANT: Vérifie d'abord les IDs de tes entreprises avec:
-- SELECT id, name FROM entreprises ORDER BY id;

-- Contrat 1 - TechCorp Solutions
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    1,
    'CONTRACT-2024-001', 'Enterprise', 'Actif',
    '2024-01-15', '2025-01-15', '2024-01-10', '2025-01-15',
    125000.00, 10416.67, 'EUR',
    'Contrat Enterprise pour solutions de bien-être au travail. Accès complet à toutes les plateformes, coaching personnalisé pour 250 employés, et suivi mensuel avec rapports détaillés.',
    'Renouvellement automatique si non résilié 30 jours avant échéance. Support prioritaire 24/7 inclus.',
    250,
    NOW(), NOW()
);

-- Contrat 2 - Santé & Bien-être Pro
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    2,
    'CONTRACT-2024-002', 'Premium', 'Actif',
    '2024-02-20', '2024-12-20', '2024-02-18', '2024-12-20',
    85000.00, 7083.33, 'EUR',
    'Contrat Premium pour programme de santé et bien-être. Ateliers mensuels de prévention, consultations individuelles, et accès à la plateforme de suivi santé.',
    'Possibilité d étendre la couverture à 200 employés avec avenant. Formation des managers incluse.',
    180,
    NOW(), NOW()
);

-- Contrat 3 - Innovation Hub
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    3,
    'CONTRACT-2024-003', 'Standard', 'Actif',
    '2024-03-10', '2024-09-10', '2024-03-08', NULL,
    45000.00, 7500.00, 'EUR',
    'Contrat Standard de 6 mois pour programme de bien-être. Accès à la plateforme digitale, webinaires mensuels, et ressources documentaires.',
    'Contrat pilote avec option de renouvellement. Évaluation à mi-parcours prévue.',
    95,
    NOW(), NOW()
);

-- Contrat 4 - Green Energy Co
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    4,
    'CONTRACT-2024-004', 'Enterprise', 'Actif',
    '2024-04-05', '2025-04-05', '2024-04-01', '2025-04-05',
    180000.00, 15000.00, 'EUR',
    'Contrat Enterprise pour 320 employés. Programme complet incluant ergonomie, prévention des TMS, gestion du stress, et suivi médical préventif.',
    'Interventions sur site mensuelles. Programme personnalisé selon les métiers (bureaux et terrain).',
    320,
    NOW(), NOW()
);

-- Contrat 5 - Digital Marketing Agency
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    5,
    'CONTRACT-2024-005', 'Premium', 'En négociation',
    '2024-06-01', '2025-06-01', NULL, NULL,
    95000.00, 7916.67, 'EUR',
    'Contrat Premium en cours de négociation. Programme de bien-être digital adapté aux équipes marketing. Focus sur la gestion du stress et l équilibre vie pro/perso.',
    'En attente de validation budgétaire. Proposition valable jusqu au 31 mai 2024.',
    145,
    NOW(), NOW()
);

-- Contrat 6 - Finance & Co
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    6,
    'CONTRACT-2024-006', 'Enterprise', 'Actif',
    '2024-01-10', '2025-01-10', '2024-01-05', '2025-01-10',
    140000.00, 11666.67, 'EUR',
    'Contrat Enterprise annuel pour secteur financier. Programme de prévention du burn-out, gestion du stress en période de forte activité, et coaching individuel pour managers.',
    'Renouvellement automatique. Sessions de groupe et individuelles selon besoins.',
    210,
    NOW(), NOW()
);

-- Contrat 7 - EduTech Solutions
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    7,
    'CONTRACT-2024-007', 'Standard', 'Actif',
    '2024-05-01', '2024-11-01', '2024-04-28', NULL,
    55000.00, 9166.67, 'EUR',
    'Contrat Standard de 6 mois pour secteur éducatif. Programme de bien-être adapté aux enseignants et formateurs. Focus sur la voix, la posture, et la gestion de classe.',
    'Contrat renouvelable. Évaluation à 3 mois pour ajustements éventuels.',
    175,
    NOW(), NOW()
);

-- Contrat 8 - Retail Pro
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    8,
    'CONTRACT-2024-008', 'Premium', 'Actif',
    '2024-03-15', '2025-03-15', '2024-03-12', '2025-03-15',
    110000.00, 9166.67, 'EUR',
    'Contrat Premium annuel pour commerce de détail. Programme de prévention des troubles musculo-squelettiques, gestion de la fatigue, et bien-être en magasin.',
    'Formation des équipes en présentiel. Support adapté aux horaires décalés.',
    280,
    NOW(), NOW()
);

-- Contrat 9 - HealthCare Plus
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    9,
    'CONTRACT-2024-009', 'Enterprise', 'Actif',
    '2024-02-01', '2025-02-01', '2024-01-28', '2025-02-01',
    130000.00, 10833.33, 'EUR',
    'Contrat Enterprise pour établissement de santé. Programme de prévention de l épuisement professionnel, gestion du stress des soignants, et soutien psychologique.',
    'Interventions adaptées aux contraintes hospitalières. Disponibilité 24/7 pour urgences.',
    195,
    NOW(), NOW()
);

-- Contrat 10 - Logistics Express
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    10,
    'CONTRACT-2024-010', 'Premium', 'Actif',
    '2024-01-20', '2024-10-20', '2024-01-18', NULL,
    105000.00, 11666.67, 'EUR',
    'Contrat Premium de 9 mois pour secteur logistique. Programme de prévention des accidents, ergonomie pour chauffeurs et manutentionnaires, et gestion de la fatigue.',
    'Contrat adapté aux horaires décalés. Interventions sur sites multiples possibles.',
    420,
    NOW(), NOW()
);

-- Contrat 11 - Real Estate Group
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    11,
    'CONTRACT-2024-011', 'Standard', 'En attente signature',
    '2024-07-01', '2025-01-01', NULL, NULL,
    48000.00, 8000.00, 'EUR',
    'Contrat Standard de 6 mois pour agence immobilière. Programme de bien-être pour commerciaux, gestion du stress, et équilibre vie pro/perso.',
    'En attente de signature. Démarrage prévu le 1er juillet 2024.',
    165,
    NOW(), NOW()
);

-- Contrat 12 - Food & Beverage Co
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    12,
    'CONTRACT-2024-012', 'Premium', 'Actif',
    '2024-04-10', '2024-12-10', '2024-04-08', NULL,
    72000.00, 9000.00, 'EUR',
    'Contrat Premium de 8 mois pour restauration. Programme de prévention des TMS en cuisine, gestion de la chaleur, et bien-être des équipes en salle.',
    'Formation HACCP et bien-être combinées. Adapté aux horaires de restauration.',
    110,
    NOW(), NOW()
);

-- Contrat 13 - Media Production
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    13,
    'CONTRACT-2024-013', 'Standard', 'Actif',
    '2024-03-01', '2024-09-01', '2024-02-28', NULL,
    42000.00, 7000.00, 'EUR',
    'Contrat Standard de 6 mois pour production média. Programme de prévention des troubles visuels, gestion du stress des deadlines, et ergonomie des postes de travail.',
    'Contrat pilote. Évaluation à 3 mois pour extension éventuelle.',
    85,
    NOW(), NOW()
);

-- Contrat 14 - Construction Modern
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    14,
    'CONTRACT-2024-014', 'Enterprise', 'Actif',
    '2024-01-05', '2025-01-05', '2024-01-02', '2025-01-05',
    195000.00, 16250.00, 'EUR',
    'Contrat Enterprise annuel pour BTP. Programme complet de prévention des accidents, ergonomie sur chantier, gestion de la pénibilité, et suivi médical renforcé.',
    'Interventions sur chantiers. Programme adapté aux métiers du bâtiment (ouvriers, conducteurs, encadrement).',
    350,
    NOW(), NOW()
);

-- Contrat 15 - Consulting Experts
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    15,
    'CONTRACT-2024-015', 'Premium', 'Actif',
    '2024-05-15', '2024-11-15', '2024-05-12', NULL,
    68000.00, 11333.33, 'EUR',
    'Contrat Premium de 6 mois pour cabinet de conseil. Programme de gestion du stress des consultants, équilibre vie pro/perso, et prévention du burn-out.',
    'Sessions individuelles et collectives. Support adapté aux déplacements fréquents.',
    125,
    NOW(), NOW()
);

-- Contrat supplémentaire - TechCorp Solutions (contrat expiré)
INSERT INTO contrats (
    entreprise_id, numero_contrat, type_contrat, statut,
    date_debut, date_fin, date_signature, date_renouvellement,
    montant_annuel, montant_mensuel, devise,
    description, conditions_particulieres, nombre_employes_couverts,
    created_at, updated_at
) VALUES (
    1,
    'CONTRACT-2023-045', 'Premium', 'Expiré',
    '2023-01-15', '2023-12-31', '2023-01-10', NULL,
    95000.00, 7916.67, 'EUR',
    'Contrat Premium précédent. Programme de bien-être digital et coaching. Renouvelé en 2024 avec upgrade Enterprise.',
    'Contrat expiré. Remplacé par CONTRACT-2024-001.',
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
    4,
    'CONTRACT-2025-001', 'Enterprise', 'En négociation',
    '2025-04-05', '2026-04-05', NULL, NULL,
    200000.00, 16666.67, 'EUR',
    'Renouvellement et extension du contrat Enterprise. Extension de la couverture à 400 employés et ajout de nouveaux services de prévention.',
    'En cours de négociation pour renouvellement 2025. Proposition valable jusqu au 15 mars 2025.',
    400,
    NOW(), NOW()
);


