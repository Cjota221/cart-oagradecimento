-- Migração para projeto compartilhado (ex.: Vexx + Imprimax no mesmo Supabase)
-- Executar uma vez no SQL Editor.

begin;

-- Renomeia tabelas se os nomes antigos existirem e os novos ainda não.
do $$
begin
  if to_regclass('public.profiles') is not null and to_regclass('public.imprimax_profiles') is null then
    alter table public.profiles rename to imprimax_profiles;
  end if;

  if to_regclass('public.payments') is not null and to_regclass('public.imprimax_payments') is null then
    alter table public.payments rename to imprimax_payments;
  end if;

  if to_regclass('public.templates') is not null and to_regclass('public.imprimax_templates') is null then
    alter table public.templates rename to imprimax_templates;
  end if;
end $$;

-- Ajusta nomes de índices antigos para padrão novo (idempotente).
do $$
begin
  if exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_payments_user_id') then
    alter index public.idx_payments_user_id rename to idx_imprimax_payments_user_id;
  end if;
  if exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_payments_status') then
    alter index public.idx_payments_status rename to idx_imprimax_payments_status;
  end if;
  if exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_templates_active') then
    alter index public.idx_templates_active rename to idx_imprimax_templates_active;
  end if;
  if exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_templates_category') then
    alter index public.idx_templates_category rename to idx_imprimax_templates_category;
  end if;
end $$;

-- Limpa policies antigas para recriar com nomes novos.
drop policy if exists profiles_select_own on public.imprimax_profiles;
drop policy if exists profiles_update_own on public.imprimax_profiles;
drop policy if exists payments_select_own on public.imprimax_payments;
drop policy if exists templates_select_active on public.imprimax_templates;

-- Garante RLS ligado.
alter table if exists public.imprimax_profiles enable row level security;
alter table if exists public.imprimax_payments enable row level security;
alter table if exists public.imprimax_templates enable row level security;

-- Recria policies com prefixo.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='imprimax_profiles' and policyname='imprimax_profiles_select_own'
  ) then
    create policy imprimax_profiles_select_own on public.imprimax_profiles
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='imprimax_profiles' and policyname='imprimax_profiles_update_own'
  ) then
    create policy imprimax_profiles_update_own on public.imprimax_profiles
      for update using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='imprimax_payments' and policyname='imprimax_payments_select_own'
  ) then
    create policy imprimax_payments_select_own on public.imprimax_payments
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='imprimax_templates' and policyname='imprimax_templates_select_active'
  ) then
    create policy imprimax_templates_select_active on public.imprimax_templates
      for select using (is_active = true);
  end if;
end $$;

commit;
