-- Cria/promove o perfil admin do Imprimax.
--
-- Importante:
-- 1. Crie o usuario no Supabase Auth com o e-mail e a senha desejados
--    em Authentication > Users, ou use a API Admin createUser.
-- 2. Depois execute este SQL trocando os e-mails abaixo pelos admins.
-- 3. Nao salve senha real neste arquivo.

begin;

alter table public.imprimax_profiles add column if not exists email text;
alter table public.imprimax_profiles add column if not exists has_access boolean default false;
alter table public.imprimax_profiles add column if not exists is_admin boolean default false;

with admin_emails(email) as (
  values
    ('<ADMIN_EMAIL>'),
    ('<SECOND_ADMIN_EMAIL>')
)
insert into public.imprimax_profiles (
  id,
  tenant_id,
  full_name,
  email,
  has_access,
  is_admin
)
select
  users.id,
  (
    select profiles.tenant_id
    from public.imprimax_profiles as profiles
    where profiles.tenant_id is not null
    limit 1
  ),
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name', 'Admin Imprimax'),
  users.email,
  true,
  true
from auth.users
  as users
inner join admin_emails
  on lower(users.email) = lower(admin_emails.email)
on conflict (id) do update
set
  full_name = coalesce(public.imprimax_profiles.full_name, excluded.full_name),
  email = excluded.email,
  has_access = true,
  is_admin = true;

do $$
declare
  missing_email text;
begin
  with admin_emails(email) as (
    values
      ('<ADMIN_EMAIL>'),
      ('<SECOND_ADMIN_EMAIL>')
  )
  select admin_emails.email
    into missing_email
  from admin_emails
  left join auth.users
    on lower(auth.users.email) = lower(admin_emails.email)
  where auth.users.id is null
  limit 1;

  if missing_email is not null then
    raise exception 'Usuario admin nao existe no Supabase Auth: %', missing_email;
  end if;
end $$;

commit;
