-- Habilita extensão para UUID randômico
create extension if not exists pgcrypto;

-- Usuários (complementa auth.users)
create table if not exists public.imprimax_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  has_access boolean default false,
  is_admin boolean default false,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Pagamentos
create table if not exists public.imprimax_payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.imprimax_profiles(id) on delete set null,
  mp_payment_id text unique,
  mp_preference_id text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  amount numeric,
  created_at timestamptz default now()
);

create index if not exists idx_imprimax_payments_user_id on public.imprimax_payments(user_id);
create index if not exists idx_imprimax_payments_status on public.imprimax_payments(status);

-- Templates
create table if not exists public.imprimax_templates (
  id uuid default gen_random_uuid() primary key,
  name text,
  category text check (category in ('cartao_agradecimento', 'tag_produto', 'etiqueta')),
  front_url text,
  back_url text,
  is_free boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_imprimax_templates_active on public.imprimax_templates(is_active);
create index if not exists idx_imprimax_templates_category on public.imprimax_templates(category);

-- RLS
alter table public.imprimax_profiles enable row level security;
alter table public.imprimax_payments enable row level security;
alter table public.imprimax_templates enable row level security;

-- Profiles: usuário lê/edita apenas o seu perfil
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imprimax_profiles' and policyname = 'imprimax_profiles_select_own'
  ) then
    create policy imprimax_profiles_select_own on public.imprimax_profiles
      for select using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imprimax_profiles' and policyname = 'imprimax_profiles_update_own'
  ) then
    create policy imprimax_profiles_update_own on public.imprimax_profiles
      for update using (auth.uid() = id);
  end if;
end $$;

-- Payments: usuário só visualiza os próprios pagamentos
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imprimax_payments' and policyname = 'imprimax_payments_select_own'
  ) then
    create policy imprimax_payments_select_own on public.imprimax_payments
      for select using (auth.uid() = user_id);
  end if;
end $$;

-- Templates: todos autenticados podem ver templates ativos
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imprimax_templates' and policyname = 'imprimax_templates_select_active'
  ) then
    create policy imprimax_templates_select_active on public.imprimax_templates
      for select using (is_active = true);
  end if;
end $$;
