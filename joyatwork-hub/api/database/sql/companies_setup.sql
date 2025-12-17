-- Script SQL pour créer la table companies et l'alimenter avec des données

-- 1. Création de la table companies
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employees INT NOT NULL DEFAULT 0,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
    description TEXT,
    wellness_programs JSON,
    status ENUM('Actif', 'En négociation', 'Inactif') NOT NULL DEFAULT 'Actif',
    contract_value DECIMAL(10,2),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Insertion des données d'exemple
INSERT INTO companies (name, sector, location, employees, phone, email, website, description, wellness_programs, status, contract_value, verified) VALUES 
('TechCorp Solutions', 'Technologie', 'Paris, France', 250, '+33142567890', 'contact@techcorp.fr', 'https://www.techcorp.fr', 'Entreprise leader en solutions digitales innovantes pour la transformation numérique des entreprises.', '["Programme sport", "Télétravail", "Méditation", "Formation bien-être"]', 'Actif', 45000.00, TRUE),

('BioHealth Industries', 'Santé', 'Lyon, France', 180, '+33478123456', 'rh@biohealth.fr', 'https://www.biohealth.fr', 'Spécialisée dans les biotechnologies médicales et la recherche pharmaceutique avancée.', '["Checkup santé", "Nutrition", "Ergonomie", "Soutien psychologique"]', 'Actif', 32000.00, TRUE),

('Green Energy Co', 'Énergie', 'Marseille, France', 320, '+33491567890', 'info@greenenergy.fr', 'https://www.greenenergy.fr', 'Solutions d\'énergies renouvelables et développement durable pour un avenir plus vert.', '["Vélo électrique", "Jardinage", "Écologie", "Sport nature"]', 'Actif', 67000.00, TRUE),

('FinanceFirst Group', 'Finance', 'La Défense, France', 450, '+33155789012', 'contact@financefirst.fr', 'https://www.financefirst.fr', 'Services financiers et conseil en investissement pour particuliers et entreprises.', '["Gestion stress", "Formation bien-être", "Coaching", "Relaxation"]', 'Actif', 89000.00, TRUE),

('EduTech Innovation', 'Éducation', 'Toulouse, France', 95, '+33561234567', 'hello@edutech.fr', 'https://www.edutech-innovation.fr', 'Plateformes d\'apprentissage numériques et solutions éducatives innovantes.', '["Flexibilité horaire", "Formation continue", "Team building"]', 'En négociation', 25000.00, TRUE),

('LogiFlow Systems', 'Logistique', 'Lille, France', 280, '+33320456789', 'contact@logiflow.fr', 'https://www.logiflow-systems.fr', 'Solutions logistiques et supply chain pour optimiser les flux de marchandises.', '["Sécurité au travail", "Ergonomie postes", "Prévention TMS"]', 'Actif', 54000.00, TRUE),

('ArtCreative Studio', 'Créatif', 'Bordeaux, France', 65, '+33556789012', 'studio@artcreative.fr', 'https://www.artcreative.fr', 'Agence créative spécialisée dans le design graphique et la communication visuelle.', '["Ateliers créatifs", "Pause bien-être", "Inspiration"]', 'Actif', 18000.00, TRUE),

('Manufacturing Plus', 'Industrie', 'Strasbourg, France', 420, '+33388234567', 'contact@manufacturing-plus.fr', 'https://www.manufacturing-plus.fr', 'Fabrication industrielle et solutions d\'automatisation pour l\'industrie 4.0.', '["Sécurité renforcée", "Ergonomie", "Prévention accidents"]', 'Actif', 75000.00, TRUE);

-- 3. Vérification des données insérées
SELECT * FROM companies;

-- 4. Statistiques rapides
SELECT 
    COUNT(*) as total_companies,
    SUM(employees) as total_employees,
    SUM(contract_value) as total_revenue,
    AVG(contract_value) as average_contract_value
FROM companies;

-- 5. Répartition par secteur
SELECT sector, COUNT(*) as nombre_entreprises, SUM(employees) as total_employes
FROM companies 
GROUP BY sector 
ORDER BY nombre_entreprises DESC;
