-- =============================================================
-- Fase A — Fundação do app Evangelho
-- Executar no Supabase SQL Editor (project > SQL Editor > New query).
-- Idempotente: pode rodar várias vezes sem quebrar (usa DROP IF EXISTS).
-- =============================================================

-- ---------- Tipos ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('super_admin', 'pastor', 'fiel');
  end if;
  if not exists (select 1 from pg_type where typname = 'igreja_status') then
    create type public.igreja_status as enum ('pendente', 'aprovada', 'rejeitada');
  end if;
end $$;

-- ---------- Tabelas ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null,
  role public.user_role not null default 'fiel',
  criado_em timestamptz not null default now()
);

create table if not exists public.igrejas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text not null,
  estado text not null default 'SP',
  endereco text,
  foto_url text,
  status public.igreja_status not null default 'pendente',
  motivo_rejeicao text,
  criada_por uuid not null references public.profiles(id) on delete restrict,
  criada_em timestamptz not null default now(),
  aprovada_em timestamptz,
  aprovada_por uuid references public.profiles(id)
);

create table if not exists public.pastor_igrejas (
  pastor_id uuid not null references public.profiles(id) on delete cascade,
  igreja_id uuid not null references public.igrejas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (pastor_id, igreja_id)
);

create table if not exists public.fiel_segue (
  fiel_id uuid not null references public.profiles(id) on delete cascade,
  igreja_id uuid not null references public.igrejas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (fiel_id, igreja_id)
);

-- Dízimos — estrutura pronta para Mercado Pago (PIX + cartão). Integração vem na Fase E.
create table if not exists public.dizimos (
  id uuid primary key default gen_random_uuid(),
  fiel_id uuid not null references public.profiles(id) on delete restrict,
  igreja_id uuid not null references public.igrejas(id) on delete restrict,
  valor_centavos int not null check (valor_centavos > 0),
  metodo text not null check (metodo in ('pix', 'cartao_credito', 'cartao_debito')),
  gateway text not null default 'mercado_pago',
  gateway_payment_id text,
  pix_qrcode text,
  pix_qrcode_imagem_base64 text,
  pix_vencimento timestamptz,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'recusado', 'estornado', 'cancelado')),
  criado_em timestamptz not null default now(),
  pago_em timestamptz
);

create index if not exists idx_dizimos_igreja on public.dizimos (igreja_id, criado_em desc);
create index if not exists idx_dizimos_fiel on public.dizimos (fiel_id, criado_em desc);

-- ---------- Funções utilitárias ----------

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Trigger: ao criar auth.users, cria profile automaticamente como fiel.
-- Admin troca a role manualmente depois (ou via tela /admin).
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
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'fiel')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------- RLS ----------

alter table public.profiles      enable row level security;
alter table public.igrejas       enable row level security;
alter table public.pastor_igrejas enable row level security;
alter table public.fiel_segue    enable row level security;
alter table public.dizimos       enable row level security;

-- Reset de policies para rodadas idempotentes
do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','igrejas','pastor_igrejas','fiel_segue','dizimos')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- profiles
create policy "profiles: ler o próprio"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: super_admin lê todos"
  on public.profiles for select using (public.auth_role() = 'super_admin');

create policy "profiles: usuário edita o próprio"
  on public.profiles for update using (auth.uid() = id);

create policy "profiles: super_admin edita qualquer"
  on public.profiles for update using (public.auth_role() = 'super_admin');

-- igrejas
create policy "igrejas: aprovadas visíveis a autenticados"
  on public.igrejas for select
  using (status = 'aprovada' and auth.role() = 'authenticated');

create policy "igrejas: pastor lê as próprias"
  on public.igrejas for select
  using (exists (
    select 1 from public.pastor_igrejas
    where pastor_id = auth.uid() and igreja_id = igrejas.id
  ));

create policy "igrejas: super_admin lê todas"
  on public.igrejas for select
  using (public.auth_role() = 'super_admin');

create policy "igrejas: pastor cria nova pendente"
  on public.igrejas for insert
  with check (
    public.auth_role() in ('pastor', 'super_admin')
    and criada_por = auth.uid()
    and status = 'pendente'
  );

create policy "igrejas: super_admin atualiza qualquer"
  on public.igrejas for update
  using (public.auth_role() = 'super_admin');

create policy "igrejas: pastor edita a sua"
  on public.igrejas for update
  using (exists (
    select 1 from public.pastor_igrejas
    where pastor_id = auth.uid() and igreja_id = igrejas.id
  ));

-- pastor_igrejas
create policy "pastor_igrejas: pastor lê os próprios"
  on public.pastor_igrejas for select
  using (pastor_id = auth.uid());

create policy "pastor_igrejas: super_admin lê todos"
  on public.pastor_igrejas for select
  using (public.auth_role() = 'super_admin');

create policy "pastor_igrejas: pastor vincula a si"
  on public.pastor_igrejas for insert
  with check (pastor_id = auth.uid());

create policy "pastor_igrejas: super_admin gerencia"
  on public.pastor_igrejas for all
  using (public.auth_role() = 'super_admin')
  with check (public.auth_role() = 'super_admin');

-- fiel_segue
create policy "fiel_segue: ler o próprio"
  on public.fiel_segue for select using (fiel_id = auth.uid());

create policy "fiel_segue: adicionar"
  on public.fiel_segue for insert with check (fiel_id = auth.uid());

create policy "fiel_segue: remover"
  on public.fiel_segue for delete using (fiel_id = auth.uid());

-- dizimos
create policy "dizimos: fiel lê os próprios"
  on public.dizimos for select using (fiel_id = auth.uid());

create policy "dizimos: pastor lê os da igreja"
  on public.dizimos for select
  using (exists (
    select 1 from public.pastor_igrejas
    where pastor_id = auth.uid() and igreja_id = dizimos.igreja_id
  ));

create policy "dizimos: super_admin lê todos"
  on public.dizimos for select
  using (public.auth_role() = 'super_admin');

create policy "dizimos: fiel cria pendente"
  on public.dizimos for insert
  with check (fiel_id = auth.uid() and status = 'pendente');
