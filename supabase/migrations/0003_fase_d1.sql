-- =============================================================
-- Fase D-1 — Conteúdo transversal (eventos, campanhas, vagas, versículos)
-- Executar no Supabase SQL Editor depois do 0002_fase_b.sql.
-- Idempotente.
-- =============================================================

-- ---------- Tipos ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'evento_categoria') then
    create type public.evento_categoria as enum ('cultural', 'esportivo', 'educativo', 'solidario', 'saude', 'missao', 'show', 'curso', 'outros');
  end if;
  if not exists (select 1 from pg_type where typname = 'vaga_tipo') then
    create type public.vaga_tipo as enum ('clt', 'pj', 'estagio', 'temporaria', 'voluntariado');
  end if;
  if not exists (select 1 from pg_type where typname = 'escopo_conteudo') then
    create type public.escopo_conteudo as enum ('geral', 'igreja');
  end if;
end $$;

-- ---------- Tabelas ----------

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data_inicio timestamptz not null,
  data_fim timestamptz,
  local text,
  cidade text,
  estado text default 'SP',
  categoria public.evento_categoria not null default 'outros',
  imagem_url text,
  link text,
  escopo public.escopo_conteudo not null default 'geral',
  igreja_id uuid references public.igrejas(id) on delete cascade,
  publicado boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now(),
  check ((escopo = 'geral' and igreja_id is null) or (escopo = 'igreja' and igreja_id is not null))
);

create index if not exists idx_eventos_data on public.eventos (data_inicio);
create index if not exists idx_eventos_escopo on public.eventos (escopo, publicado);

create table if not exists public.campanhas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  imagem_url text,
  cor text not null default 'dourado' check (cor in ('azul', 'verde', 'ambar', 'dourado')),
  call_to_action text,
  link text,
  escopo public.escopo_conteudo not null default 'geral',
  igreja_id uuid references public.igrejas(id) on delete cascade,
  ativa_de timestamptz not null default now(),
  ativa_ate timestamptz,
  publicada boolean not null default true,
  criada_por uuid not null references public.profiles(id) on delete restrict,
  criada_em timestamptz not null default now(),
  check ((escopo = 'geral' and igreja_id is null) or (escopo = 'igreja' and igreja_id is not null))
);

create index if not exists idx_campanhas_ativas on public.campanhas (publicada, ativa_ate);

create table if not exists public.vagas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  empresa text not null,
  descricao text,
  cidade text,
  estado text default 'SP',
  tipo public.vaga_tipo not null default 'clt',
  salario text,
  link_candidatura text,
  publicada boolean not null default false,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists idx_vagas_publicada on public.vagas (publicada, criado_em desc);

create table if not exists public.versiculos (
  id uuid primary key default gen_random_uuid(),
  texto text not null check (length(trim(texto)) > 0),
  referencia text not null,
  do_dia_em date,
  criado_por uuid not null references public.profiles(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create unique index if not exists uniq_versiculo_dia on public.versiculos (do_dia_em) where do_dia_em is not null;

-- ---------- RLS ----------

alter table public.eventos    enable row level security;
alter table public.campanhas  enable row level security;
alter table public.vagas      enable row level security;
alter table public.versiculos enable row level security;

do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('eventos','campanhas','vagas','versiculos')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- EVENTOS
create policy "eventos: autenticado lê publicados"
  on public.eventos for select to authenticated
  using (
    publicado = true
    and (
      escopo = 'geral'
      or exists (select 1 from public.igrejas i where i.id = eventos.igreja_id and i.status = 'aprovada')
    )
  );

create policy "eventos: pastor lê os da sua igreja"
  on public.eventos for select to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "eventos: super_admin lê todos"
  on public.eventos for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "eventos: super_admin cria geral"
  on public.eventos for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) = 'super_admin'
    and criado_por = auth.uid()
  );

create policy "eventos: pastor cria da sua igreja"
  on public.eventos for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) in ('pastor', 'super_admin')
    and criado_por = auth.uid()
    and escopo = 'igreja'
    and igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "eventos: super_admin atualiza/apaga"
  on public.eventos for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "eventos: pastor atualiza/apaga da sua igreja"
  on public.eventos for update to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "eventos: super_admin deleta"
  on public.eventos for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "eventos: pastor deleta da sua igreja"
  on public.eventos for delete to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

-- CAMPANHAS (mesmo padrão de eventos)
create policy "campanhas: autenticado lê publicadas ativas"
  on public.campanhas for select to authenticated
  using (
    publicada = true
    and (ativa_ate is null or ativa_ate >= now())
    and (
      escopo = 'geral'
      or exists (select 1 from public.igrejas i where i.id = campanhas.igreja_id and i.status = 'aprovada')
    )
  );

create policy "campanhas: pastor lê as da sua igreja"
  on public.campanhas for select to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "campanhas: super_admin lê todas"
  on public.campanhas for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "campanhas: super_admin cria geral"
  on public.campanhas for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) = 'super_admin'
    and criada_por = auth.uid()
  );

create policy "campanhas: pastor cria da sua igreja"
  on public.campanhas for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) in ('pastor', 'super_admin')
    and criada_por = auth.uid()
    and escopo = 'igreja'
    and igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "campanhas: super_admin atualiza"
  on public.campanhas for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "campanhas: pastor atualiza da sua igreja"
  on public.campanhas for update to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "campanhas: super_admin deleta"
  on public.campanhas for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "campanhas: pastor deleta da sua igreja"
  on public.campanhas for delete to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

-- VAGAS (só super_admin publica)
create policy "vagas: autenticado lê publicadas"
  on public.vagas for select to authenticated
  using (publicada = true);

create policy "vagas: super_admin lê todas"
  on public.vagas for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "vagas: super_admin cria"
  on public.vagas for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) = 'super_admin'
    and criado_por = auth.uid()
  );

create policy "vagas: super_admin atualiza"
  on public.vagas for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "vagas: super_admin deleta"
  on public.vagas for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- VERSICULOS
create policy "versiculos: autenticado lê"
  on public.versiculos for select to authenticated
  using (true);

create policy "versiculos: super_admin cria"
  on public.versiculos for insert to authenticated
  with check (
    (select role from public.profiles where id = auth.uid()) = 'super_admin'
    and criado_por = auth.uid()
  );

create policy "versiculos: super_admin atualiza"
  on public.versiculos for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "versiculos: super_admin deleta"
  on public.versiculos for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');
