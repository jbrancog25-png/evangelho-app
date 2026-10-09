-- =============================================================
-- Fase D-4 — Reforço de segurança no cadastro público
-- Executar no Supabase SQL Editor depois do 0005_fase_d3.sql.
-- Idempotente.
-- =============================================================

-- Antes: a trigger lia role via `raw_user_meta_data->>'role'`, o que permitia
-- a qualquer um pedir super_admin/pastor via chamada direta à API.
-- Agora: todo signup público vira 'fiel'; super_admin promove depois.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    'fiel'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
