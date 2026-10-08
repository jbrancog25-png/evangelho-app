-- =============================================================
-- Fase D-2 — Cursos, Entidades parceiras, Cestas básicas, Clube de benefícios
-- Executar no Supabase SQL Editor depois do 0003_fase_d1.sql.
-- Idempotente.
-- =============================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'curso_nivel') then
    create type public.curso_nivel as enum ('basico', 'intermediario', 'avancado', 'livre');
  end if;
  if not exists (select 1 from pg_type where typname = 'parceiro_tipo') then
    create type public.parceiro_tipo as enum ('igreja', 'ong', 'comercio', 'escola', 'publico', 'outro');
  end if;
end $$;

-- ---------- Tabelas ----------

create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  instituicao text,
  descricao text,
  categoria text,
  nivel public.curso_nivel not null default 'livre',
  duracao text,
  modalidade text,
  link text,
  imagem_url text,
  gratuito boolean not null default true,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_cursos_publicado on public.cursos (publicado, criado_em desc);

create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  tipo public.parceiro_tipo not null default 'outro',
  logo_url text,
  link text,
  cidade text,
  estado text default 'SP',
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_parceiros_publicado on public.parceiros (publicado, nome);

create table if not exists public.cestas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  imagem_url text,
  quantidade_disponivel int not null default 0 check (quantidade_disponivel >= 0),
  custo_pontos int not null default 0 check (custo_pontos >= 0),
  local_retirada text,
  cidade text,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_cestas_publicado on public.cestas (publicado, criado_em desc);

create table if not exists public.beneficios (
  id uuid primary key default gen_random_uuid(),
  parceiro_nome text not null,
  titulo text not null,
  descricao text,
  codigo_cupom text,
  link text,
  categoria text,
  desconto_percentual int check (desconto_percentual between 0 and 100),
  imagem_url text,
  valido_ate timestamptz,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_beneficios_publicado on public.beneficios (publicado, criado_em desc);

-- ---------- RLS ----------

alter table public.cursos      enable row level security;
alter table public.parceiros   enable row level security;
alter table public.cestas      enable row level security;
alter table public.beneficios  enable row level security;

do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('cursos','parceiros','cestas','beneficios')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- Padrão genérico: super_admin tudo; autenticado lê publicados.
-- (Macro para repetir seria ideal, mas pg puro não tem — segue manual.)

-- CURSOS
create policy "cursos: autenticado lê publicados"
  on public.cursos for select to authenticated
  using (publicado = true);
create policy "cursos: super_admin lê todos"
  on public.cursos for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "cursos: super_admin cria"
  on public.cursos for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "cursos: super_admin atualiza"
  on public.cursos for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "cursos: super_admin deleta"
  on public.cursos for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- PARCEIROS
create policy "parceiros: autenticado lê publicados"
  on public.parceiros for select to authenticated
  using (publicado = true);
create policy "parceiros: super_admin lê todos"
  on public.parceiros for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "parceiros: super_admin cria"
  on public.parceiros for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "parceiros: super_admin atualiza"
  on public.parceiros for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "parceiros: super_admin deleta"
  on public.parceiros for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- CESTAS
create policy "cestas: autenticado lê publicados"
  on public.cestas for select to authenticated
  using (publicado = true);
create policy "cestas: super_admin lê todos"
  on public.cestas for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "cestas: super_admin cria"
  on public.cestas for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "cestas: super_admin atualiza"
  on public.cestas for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "cestas: super_admin deleta"
  on public.cestas for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- BENEFICIOS
create policy "beneficios: autenticado lê publicados"
  on public.beneficios for select to authenticated
  using (publicado = true);
create policy "beneficios: super_admin lê todos"
  on public.beneficios for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "beneficios: super_admin cria"
  on public.beneficios for insert to authenticated
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin' and criado_por = auth.uid());
create policy "beneficios: super_admin atualiza"
  on public.beneficios for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
create policy "beneficios: super_admin deleta"
  on public.beneficios for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
