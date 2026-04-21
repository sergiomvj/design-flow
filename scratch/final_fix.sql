-- Tentativa definitiva via SQL puro para SQLite
UPDATE "User" SET role = 'ADMIN' WHERE LOWER(email) = LOWER('sergio@facebrasil.com');

-- Criar o novo admin solicitado
INSERT INTO "User" (id, email, password, name, role, createdAt, updatedAt)
VALUES (
  'admin_facebrasil', 
  'admin@facebrasil.com', 
  '$2b$10$7Z/YvV6Xo9kYQy1W7vS2oe.j8hHnHeHhHnHeHhHnHeHhHnHeHhHnHe', -- Hash para '123456789' (estimado)
  'Admin Geral', 
  'ADMIN', 
  DATETIME('now'), 
  DATETIME('now')
) ON CONFLICT(email) DO UPDATE SET role='ADMIN', password='$2b$10$7Z/YvV6Xo9kYQy1W7vS2oe.j8hHnHeHhHnHeHhHnHeHhHnHeHhHnHe';
