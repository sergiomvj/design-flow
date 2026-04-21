-- Forçar permissões de Admin para ambos os e-mails
UPDATE "User" SET role = 'ADMIN' WHERE LOWER(email) = 'sergio@facebrasil.com';
UPDATE "User" SET role = 'ADMIN' WHERE LOWER(email) = 'admin@facebrasil.com';
