-- Script SQL pour créer la table des rendez-vous liée aux praticiens
USE mindful_journey;

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practitioner_id INT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    patient_phone VARCHAR(50),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    appointment_type ENUM('consultation', 'suivi', 'urgence', 'groupe') DEFAULT 'consultation',
    status ENUM('planifie', 'confirme', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    notes TEXT,
    price DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE
);

-- Insertion de quelques rendez-vous d'exemple
INSERT IGNORE INTO appointments (id, practitioner_id, patient_name, patient_email, patient_phone, appointment_date, appointment_time, duration_minutes, appointment_type, status, notes, price) VALUES
(1, 1, 'Sophie Durand', 'sophie.durand@email.com', '06 12 34 56 78', '2025-10-15', '09:00:00', 60, 'consultation', 'confirme', 'Première consultation - stress au travail', 80.00),
(2, 1, 'Marc Lemoine', 'marc.lemoine@email.com', '06 23 45 67 89', '2025-10-15', '10:30:00', 45, 'suivi', 'planifie', 'Suivi thérapie cognitive', 70.00),
(3, 2, 'Claire Bernard', 'claire.bernard@email.com', '06 34 56 78 90', '2025-10-16', '14:00:00', 90, 'consultation', 'confirme', 'Évaluation psychologique complète', 120.00),
(4, 3, 'Thomas Moreau', 'thomas.moreau@email.com', '06 45 67 89 01', '2025-10-16', '11:00:00', 60, 'consultation', 'planifie', 'Approche holistique - burn-out', 85.00),
(5, 4, 'Julie Martinez', 'julie.martinez@email.com', '06 56 78 90 12', '2025-10-17', '09:30:00', 120, 'groupe', 'confirme', 'Séance coaching équipe', 150.00),
(6, 1, 'Pierre Dubois', 'pierre.dubois@email.com', '06 67 89 01 23', '2025-10-17', '15:00:00', 60, 'urgence', 'confirme', 'Crise anxieuse - intervention rapide', 90.00),
(7, 5, 'Emma Rousseau', 'emma.rousseau@email.com', '06 78 90 12 34', '2025-10-18', '08:30:00', 45, 'consultation', 'planifie', 'Visite médicale préventive', 65.00),
(8, 6, 'Lucas Garcia', 'lucas.garcia@email.com', '06 89 01 23 45', '2025-10-18', '16:00:00', 60, 'consultation', 'confirme', 'Séance de sophrologie - stress', 75.00),
(9, 2, 'Amélie Petit', 'amelie.petit@email.com', '06 90 12 34 56', '2025-10-19', '10:00:00', 60, 'suivi', 'planifie', 'Suivi thérapeutique - 3ème séance', 70.00),
(10, 7, 'Vincent Leroy', 'vincent.leroy@email.com', '06 01 23 45 67', '2025-10-19', '13:30:00', 75, 'consultation', 'confirme', 'TCC - troubles anxieux', 80.00);
