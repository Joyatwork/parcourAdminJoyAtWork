-- Création des tables pour mindful_journey

USE mindful_journey;

-- Table des entreprises
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des praticiens
CREATE TABLE IF NOT EXISTS practitioners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    specialty VARCHAR(255),
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insertion de données d'exemple
INSERT IGNORE INTO companies (id, name, email, phone, address) VALUES
(1, 'TechCorp Solutions', 'contact@techcorp.com', '01 23 45 67 89', '123 Rue de la Paix, Paris'),
(2, 'InnovateLab', 'hello@innovatelab.fr', '01 98 76 54 32', '456 Avenue des Champs, Lyon'),
(3, 'Digital Wellness', 'info@digitalwellness.fr', '01 11 22 33 44', '789 Boulevard Saint-Germain, Paris');

INSERT IGNORE INTO practitioners (id, name, email, phone, specialty, company_id) VALUES
(1, 'Dr. Marie Dubois', 'marie.dubois@techcorp.com', '06 12 34 56 78', 'Psychologue du travail', 1),
(2, 'Jean-Pierre Martin', 'jp.martin@techcorp.com', '06 23 45 67 89', 'Coach en bien-être', 1),
(3, 'Sophie Leclerc', 'sophie.leclerc@innovatelab.fr', '06 34 56 78 90', 'Nutritionniste', 2),
(4, 'Dr. Pierre Rousseau', 'pierre.rousseau@innovatelab.fr', '06 45 67 89 01', 'Médecin du travail', 2),
(5, 'Emma Rodriguez', 'emma.rodriguez@digitalwellness.fr', '06 56 78 90 12', 'Thérapeute', 3),
(6, 'Thomas Girard', 'thomas.girard@digitalwellness.fr', '06 67 89 01 23', 'Coach sportif', 3),
(7, 'Dr. Claire Moreau', 'claire.moreau@freelance.fr', '06 78 90 12 34', 'Psychiatre', NULL),
(8, 'Lucas Barbier', 'lucas.barbier@wellness.fr', '06 89 01 23 45', 'Masseur kinésithérapeute', NULL),
(9, 'Amélie Fontaine', 'amelie.fontaine@mindful.fr', '06 90 12 34 56', 'Sophrologue', NULL),
(10, 'Dr. Vincent Leroy', 'vincent.leroy@sante.fr', '06 01 23 45 67', 'Médecin généraliste', NULL),
(11, 'Nathalie Perrin', 'nathalie.perrin@zen.fr', '06 12 34 56 78', 'Praticienne en mindfulness', NULL),
(12, 'Alexandre Dupont', 'alex.dupont@sport.fr', '06 23 45 67 89', 'Préparateur physique', NULL),
(13, 'Dr. Isabelle Blanc', 'isabelle.blanc@psy.fr', '06 34 56 78 90', 'Psychologue clinicienne', NULL),
(14, 'Maxime Chevallier', 'maxime.chevallier@coaching.fr', '06 45 67 89 01', 'Coach de vie', NULL),
(15, 'Céline Garnier', 'celine.garnier@wellness.fr', '06 56 78 90 12', 'Aromathérapeute', NULL);
