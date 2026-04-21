create extension if not exists pgcrypto;

insert into public.users (email, password, name, role)
values (
  'admin@empresa.com',
  crypt('admin123', gen_salt('bf')),
  'Admin Inicial',
  'ADMIN'
)
on conflict (email)
do update set
  password = excluded.password,
  name = excluded.name,
  role = 'ADMIN',
  updated_at = now();
