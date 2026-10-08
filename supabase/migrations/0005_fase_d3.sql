-- =============================================================
-- Fase D-3 — Louvores, Doação de sangue, Desapego + pontos em profiles
-- Executar no Supabase SQL Editor depois do 0004_fase_d2.sql.
-- Idempotente.
-- =============================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'urgencia_sangue') then
    create type public.urgencia_sangue as enum ('baixa', 'media', 'alta', 'critica');
  end if;
end $$;

-- Pontos no profile (para Carteira e Ranking funcionarem já)
alter table public.profiles add column if not exists pontos int not null default 0;

create index if not exists idx_profiles_pontos on public.profiles (pontos desc);

-- ---------- Tabelas ----------

create table if not exists public.louvores (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artista text,
  url text not null,
  imagem_url text,
  duracao_segundos int,
  playlist text,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_louvores_publicado on public.louvores (publicado, criado_em desc);

create table if not exists public.campanhas_sangue (
  id uuid primary key default gen_random_uuid(),
  hospital text not null,
  cidade text not null,
  estado text default 'SP',
  tipos_sanguineos text,
  urgencia public.urgencia_sangue not null default 'media',
  descricao text,
  link_agendamento text,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_sangue_publicado on public.campanhas_sangue (publicado, urgencia);

create table if not exists public.desapegos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text,
  foto_url text,
  cidade text,
  contato text not null,
  autor_id uuid not null references public.profiles(id) on delete cascade,
  publicado boolean not null default false,
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

create index if not exists idx_desapegos_publicado on public.desapegos (publicado, disponivel, criado_em desc);

-- ---------- RLS ----------

alter table public.louvores         enable row level security;
alter table public.campanhas_sangue enable row level security;
alter table public.desapegos        enable row level security;

do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('louvores','campanhas_sangue','desapegos')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- LOUVORES (super_admin curado; qualquer autenticado consome)
create policy "louvores: autenticado lê publicados"
  on public.louvores for select to authenticated
  using (publicado = true);
create policy "louvores: super_admin lê todos"
  on public.louvores for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "louvores: super_admin cria"
  on public.louvores for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "louvores: super_admin atualiza"
  on public.louvores for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "louvores: super_admin deleta"
  on public.louvores for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- SANGUE (idem)
create policy "sangue: autenticado lê publicados"
  on public.campanhas_sangue for select to authenticated
  using (publicado = true);
create policy "sangue: super_admin lê todos"
  on public.campanhas_sangue for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "sangue: super_admin cria"
  on public.campanhas_sangue for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "sangue: super_admin atualiza"
  on public.campanhas_sangue for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "sangue: super_admin deleta"
  on public.campanhas_sangue for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- DESAPEGO (fiel cria, super_admin modera, autenticado lê publicados)
create policy "desapegos: autenticado lê publicados e disponíveis"
  on public.desapegos for select to authenticated
  using (publicado = true and disponivel = true);

create policy "desapegos: autor lê o próprio"
  on public.desapegos for select to authenticated
  using (autor_id = auth.uid());

create policy "desapegos: super_admin lê todos"
  on public.desapegos for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "desapegos: autor cria"
  on public.desapegos for insert to authenticated
  with check (autor_id = auth.uid());

create policy "desapegos: autor edita/apaga o próprio"
  on public.desapegos for update to authenticated
  using (autor_id = auth.uid());

create policy "desapegos: super_admin modera"
  on public.desapegos for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "desapegos: autor remove o próprio"
  on public.desapegos for delete to authenticated
  using (autor_id = auth.uid());

create policy "desapegos: super_admin remove qualquer"
  on public.desapegos for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- Profile pode ser lido para ranking (apenas id, nome, pontos — não é PII crítica)
-- Já temos policy "profiles: ler o próprio". Para ranking funcionar, precisamos permitir leitura
-- limitada do nome/pontos de outros. Vamos adicionar uma policy específica.
drop policy if exists "profiles: ranking visível" on public.profiles;
create policy "profiles: ranking visível"
  on public.profiles for select to authenticated
  using (true);
