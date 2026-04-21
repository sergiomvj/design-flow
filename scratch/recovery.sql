UPDATE "User" SET role = 'ADMIN' WHERE email = 'sergio@facebrasil.com';
INSERT OR IGNORE INTO "User" (id, email, password, name, role, createdAt, updatedAt) 
VALUES ('RECOVERY_ADMIN', 'sergio@facebrasil.com', '$2a$10$oYm6Sj6M.7Y6H/Y8O9f4e.eHhHnHeHhHnHeHhHnHeHhHnHeHhHnHe', 'Admin Emergência', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
