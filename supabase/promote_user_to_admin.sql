update public.users
set role = 'ADMIN',
    updated_at = now()
where email = 'admin@empresa.com';
