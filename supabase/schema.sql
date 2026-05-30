-- Habilita extensão para UUID randômico
create extension if not exists pgcrypto;

-- Usuários (complementa auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  has_access boolean default false,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Pagamentos
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  mp_payment_id text unique,
  mp_preference_id text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  amount numeric,
  created_at timestamptz default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);

-- Templates
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  name text,
  category text check (category in ('cartao_agradecimento', 'tag_produto', 'etiqueta')),
  front_url text,
  back_url text,
  is_free boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_templates_active on public.templates(is_active);
create index if not exists idx_templates_category on public.templates(category);

-- RLS
alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.templates enable row level security;

-- Profiles: usuário lê/edita apenas o seu perfil
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own on public.profiles
      for select using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own on public.profiles
      for update using (auth.uid() = id);
  end if;
end $$;

-- Payments: usuário só visualiza os próprios pagamentos
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_select_own'
  ) then
    create policy payments_select_own on public.payments
      for select using (auth.uid() = user_id);
  end if;
end $$;

-- Templates: todos autenticados podem ver templates ativos
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'templates' and policyname = 'templates_select_active'
  ) then
    create policy templates_select_active on public.templates
      for select using (is_active = true);
  end if;
end $$;
