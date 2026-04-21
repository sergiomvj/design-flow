create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  name text not null,
  role text not null default 'CLIENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('ADMIN', 'DESIGNER', 'CLIENT'))
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  job_number text unique,
  status text not null default 'RECEIVED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  requester_id uuid not null references public.users(id) on delete restrict on update cascade,
  company text not null,
  requester_email text not null,
  phone text not null,
  internal_sales_rep text,
  department text not null,
  contact_method text not null,
  project_type text not null,
  category text not null,
  objective text not null,
  nature text not null,
  description text not null,
  usage text not null,
  main_message text not null,
  headline text,
  required_text text,
  mandatory_info text,
  dimensions text not null,
  unit text not null,
  material text not null,
  quantity integer not null default 1,
  colors text not null,
  brand_guidelines text,
  finishing text,
  logo_url text,
  file_urls text,
  photo_urls text,
  reference_links text,
  likes text,
  dislikes text,
  deadline timestamptz,
  is_rush boolean not null default false,
  rush_reason text,
  event_date timestamptz,
  approver_name text,
  approver_contact text,
  reviewer_count integer default 1,
  revision_count integer not null default 1,
  additional_charges_aware boolean not null default false,
  designer_id uuid references public.users(id) on delete set null on update cascade,
  priority text default 'MEDIUM',
  internal_notes text,
  is_confirmed boolean not null default false,
  briefing_aware boolean not null default false,
  validation_aware boolean not null default false
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete restrict on update cascade,
  project_id uuid not null references public.projects(id) on delete cascade on update cascade
);

create index if not exists idx_projects_requester_id on public.projects(requester_id);
create index if not exists idx_projects_designer_id on public.projects(designer_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_comments_project_id on public.comments(project_id);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();
