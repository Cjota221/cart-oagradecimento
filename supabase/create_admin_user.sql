-- Cria/promove o perfil admin do Imprimax.
--
-- Importante:
-- 1. Crie o usuario no Supabase Auth com o e-mail e a senha desejados
--    em Authentication > Users, ou use a API Admin createUser.
-- 2. Depois execute este SQL trocando <ADMIN_EMAIL> pelo e-mail do admin.
-- 3. Nao salve senha real neste arquivo.

begin;

alter table public.imprimax_profiles
  add column if not exists is_admin boolean default false;

insert into public.imprimax_profiles (
  id,
  email,
  name,
  has_access,
  is_admin
)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'name', 'Admin Imprimax'),
  true,
  true
from auth.users
  as users
where lower(users.email) = lower('<ADMIN_EMAIL>')
on conflict (id) do update
set
  email = excluded.email,
  name = coalesce(public.imprimax_profiles.name, excluded.name),
  has_access = true,
  is_admin = true;

do $$
begin
  if not exists (
    select 1
    from auth.users
    where lower(email) = lower('<ADMIN_EMAIL>')
  ) then
    raise exception 'Usuario admin nao existe no Supabase Auth: %', '<ADMIN_EMAIL>';
  end if;
end $$;

commit;
