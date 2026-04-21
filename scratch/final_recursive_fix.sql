-- Limpeza e inserção do admin com hash real
UPDATE "User" SET role = 'ADMIN' WHERE LOWER(email) = 'sergio@facebrasil.com';
DELETE FROM "User" WHERE LOWER(email) = 'admin@facebrasil.com';
INSERT INTO "User" (id, email, password, name, role, createdAt, updatedAt) 
VALUES ('ADMIN_REC', 'admin@facebrasil.com', '$2b$10$qZeQAumPpF3iAcEArwIm7ODz9EZeQBtAqTlmteRvmQfDn/P3oqICK', 'Admin Geral', 'ADMIN', DATETIME('now'), DATETIME('now'));
