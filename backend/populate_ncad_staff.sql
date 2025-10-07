-- ============================================
-- NCAD Staff Population Script
-- Generated from NCAD website (www.ncad.ie)
-- ============================================

-- First, remove any test staff data (keeping only real student data)
-- Be careful: Only delete staff/admin accounts, NOT students
DELETE FROM users WHERE role IN ('staff', 'department_admin', 'master_admin');

-- ============================================
-- DEPARTMENT: Communication Design (includes Graphic Design, Moving Image, Illustration)
-- Head: John Paul Dowling
-- ============================================

-- Department Head / Master Admin
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('john.dowling@ncad.ie', '$2b$10$YourHashedPasswordHere', 'John Paul', 'Dowling', 'John Paul Dowling', 'master_admin', 'Moving Image Design', NOW());

-- Graphic Design Staff
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('ed.mcginley@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Ed', 'McGinley', 'Ed McGinley', 'staff', 'Graphic Design', NOW()),
('aoife.mcinerney@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Aoife', 'McInerney', 'Aoife McInerney', 'department_admin', 'Graphic Design', NOW()),
('stephanie.connolly@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Stephanie', 'Connolly', 'Stephanie Connolly', 'staff', 'Graphic Design', NOW());

-- Moving Image Design Staff
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('david.timmons@ncad.ie', '$2b$10$YourHashedPasswordHere', 'David', 'Timmons', 'David Timmons', 'staff', 'Moving Image Design', NOW());

-- Illustration Staff
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('brendon.deacy@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Brendon', 'Deacy', 'Brendon Deacy', 'department_admin', 'Illustration', NOW()),
('john.slade@ncad.ie', '$2b$10$YourHashedPasswordHere', 'John', 'Slade', 'John Slade', 'staff', 'Illustration', NOW());

-- Technical Staff / Administrators
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('jamie.murphy@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Jamie', 'Murphy', 'Jamie Murphy', 'staff', 'Graphic Design', NOW()),
('fiona.hodge@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Fiona', 'Hodge', 'Fiona Hodge', 'staff', 'Graphic Design', NOW()),
('david.bramley@ncad.ie', '$2b$10$YourHashedPasswordHere', 'David', 'Bramley', 'David Bramley', 'staff', 'Graphic Design', NOW());

-- ============================================
-- ADDITIONAL DESIGN FACULTY STAFF (for reference, can be used if departments expand)
-- ============================================

-- Design for Body & Environment (Fashion, Textiles, Jewellery)
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('angela.okelly@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Angela', 'O''Kelly', 'Angela O''Kelly', 'department_admin', 'Graphic Design', NOW()),
('sally.collins@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Sally', 'Collins', 'Sally Collins', 'staff', 'Graphic Design', NOW()),
('michael.cunningham@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Michael', 'Cunningham', 'Michael Cunningham', 'staff', 'Graphic Design', NOW()),
('linda.byrne@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Linda', 'Byrne', 'Linda Byrne', 'staff', 'Graphic Design', NOW()),
('natalie.coleman@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Natalie', 'Coleman', 'Natalie Coleman', 'staff', 'Graphic Design', NOW());

-- Product Design Staff
INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('sam.russell@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Sam', 'Russell', 'Sam Russell', 'department_admin', 'Graphic Design', NOW()),
('enda.odowd@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Enda', 'O''Dowd', 'Enda O''Dowd', 'staff', 'Graphic Design', NOW()),
('katharina.pfutzner@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Katharina', 'Pfützner', 'Katharina Pfützner', 'staff', 'Graphic Design', NOW()),
('caoimhe.macmahon@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Caoimhe', 'MacMahon', 'Caoimhe MacMahon', 'staff', 'Graphic Design', NOW()),
('marcus.hanratty@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Marcus', 'Hanratty', 'Marcus Hanratty', 'staff', 'Graphic Design', NOW()),
('emma.creighton@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Emma', 'Creighton', 'Emma Creighton', 'staff', 'Graphic Design', NOW());

-- ============================================
-- COLLEGE SENIOR MANAGEMENT (Master Admins)
-- ============================================

INSERT INTO users (email, password, first_name, surname, full_name, role, department, created_at)
VALUES
('sarah.glennie@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Sarah', 'Glennie', 'Sarah Glennie', 'master_admin', 'Moving Image Design', NOW()),
('gerry.mccoy@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Gerry', 'McCoy', 'Gerry McCoy', 'master_admin', 'Moving Image Design', NOW()),
('siun.hanrahan@ncad.ie', '$2b$10$YourHashedPasswordHere', 'Siún', 'Hanrahan', 'Siún Hanrahan', 'master_admin', 'Moving Image Design', NOW());

-- ============================================
-- NOTES:
-- - All passwords are set to a placeholder hash
-- - Real passwords should be set via password reset flow
-- - Department assignments follow the project requirements:
--   * Moving Image Design
--   * Graphic Design
--   * Illustration
-- - Role assignments:
--   * master_admin: Senior leadership, full system access
--   * department_admin: Programme leaders/heads
--   * staff: Lecturers and technical staff
-- ============================================

-- Verify the insert
SELECT
    id,
    full_name,
    email,
    role,
    department,
    created_at
FROM users
WHERE role IN ('staff', 'department_admin', 'master_admin')
ORDER BY department, role DESC, surname;
