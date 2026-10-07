-- =============================================================
-- Fase B — Conteúdo gerido pelo pastor
-- Executar no Supabase SQL Editor depois do 0001_fundacao.sql.
-- Idempotente.
-- =============================================================

-- ---------- Tabelas ----------

create table if not exists public.palavras (
  id uuid primary key default gen_random_uuid(),
  igreja_id uuid not null references public.igrejas(id) on delete cascade,
  autor_id uuid not null references public.profiles(id) on delete restrict,
  texto text not null check (length(trim(texto)) > 0),
  publicada boolean not null default true,
  criada_em timestamptz not null default now()
);

create index if not exists idx_palavras_igreja on public.palavras (igreja_id, criada_em desc);

create table if not exists public.cultos (
  id uuid primary key default gen_random_uuid(),
  igreja_id uuid not null references public.igrejas(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0=dom, 6=sab
  hora time not null,
  local text,
  recorrencia text not null default 'semanal' check (recorrencia in ('semanal', 'quinzenal', 'mensal', 'avulso')),
  observacao text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create index if not exists idx_cultos_igreja on public.cultos (igreja_id, ativo);

create table if not exists public.pedidos_oracao (
  id uuid primary key default gen_random_uuid(),
  igreja_id uuid not null references public.igrejas(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  autor_nome text,
  texto text not null check (length(trim(texto)) > 0),
  anonimo boolean not null default false,
  publicado boolean not null default false,
  arquivado boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists idx_oracao_igreja on public.pedidos_oracao (igreja_id, criado_em desc);

-- ---------- RLS ----------

alter table public.palavras        enable row level security;
alter table public.cultos          enable row level security;
alter table public.pedidos_oracao  enable row level security;

-- Reset de policies para rodadas idempotentes
do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('palavras','cultos','pedidos_oracao')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ---------- Helpers de policy (inline, evitando dependência da função auth_role) ----------
-- Padrão: pastor vinculado à igreja gerencia; super_admin tudo; fiel lê conteúdo de igrejas aprovadas.

-- PALAVRAS
create policy "palavras: fiel lê publicadas de igreja aprovada"
  on public.palavras for select to authenticated
  using (
    publicada = true
    and exists (
      select 1 from public.igrejas i
      where i.id = palavras.igreja_id and i.status = 'aprovada'
    )
  );

create policy "palavras: pastor lê as da sua igreja"
  on public.palavras for select to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "palavras: super_admin lê todas"
  on public.palavras for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "palavras: pastor insere"
  on public.palavras for insert to authenticated
  with check (
    autor_id = auth.uid()
    and igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "palavras: pastor atualiza/apaga"
  on public.palavras for update to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "palavras: pastor remove"
  on public.palavras for delete to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

-- CULTOS
create policy "cultos: fiel lê ativos de igreja aprovada"
  on public.cultos for select to authenticated
  using (
    ativo = true
    and exists (
      select 1 from public.igrejas i
      where i.id = cultos.igreja_id and i.status = 'aprovada'
    )
  );

create policy "cultos: pastor lê os da sua igreja"
  on public.cultos for select to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "cultos: super_admin lê todos"
  on public.cultos for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "cultos: pastor insere"
  on public.cultos for insert to authenticated
  with check (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "cultos: pastor atualiza"
  on public.cultos for update to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "cultos: pastor remove"
  on public.cultos for delete to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

-- PEDIDOS DE ORAÇÃO
-- Fiel cria pedido (pode ser anônimo), pastor publica/arquiva, fiéis leem os publicados.
create policy "oracao: fiel lê publicados de igreja aprovada"
  on public.pedidos_oracao for select to authenticated
  using (
    publicado = true and arquivado = false
    and exists (
      select 1 from public.igrejas i
      where i.id = pedidos_oracao.igreja_id and i.status = 'aprovada'
    )
  );

create policy "oracao: autor lê o próprio"
  on public.pedidos_oracao for select to authenticated
  using (autor_id = auth.uid());

create policy "oracao: pastor lê os da sua igreja"
  on public.pedidos_oracao for select to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "oracao: super_admin lê todos"
  on public.pedidos_oracao for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "oracao: autor cria"
  on public.pedidos_oracao for insert to authenticated
  with check (
    (autor_id = auth.uid() or autor_id is null)
    and exists (
      select 1 from public.igrejas i
      where i.id = pedidos_oracao.igreja_id and i.status = 'aprovada'
    )
  );

create policy "oracao: pastor atualiza (publica/arquiva)"
  on public.pedidos_oracao for update to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );

create policy "oracao: pastor remove"
  on public.pedidos_oracao for delete to authenticated
  using (
    igreja_id in (select igreja_id from public.pastor_igrejas where pastor_id = auth.uid())
  );
