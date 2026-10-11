-- =============================================================
-- Fase D-5 — Telemedicina + Agendamento de consulta (MEDIX+)
-- Portado do CONEX (supabase/043-consultas.sql), adaptado para
-- a convenção do Evangelho (profiles, auth_role, super_admin).
-- Idempotente.
-- =============================================================

-- ---------- consultas_horarios ----------
-- O que a equipe oferece — dia, hora, quantas pessoas.

create table if not exists public.consultas_horarios (
  id uuid primary key default gen_random_uuid(),
  especialidade text not null default 'clinico',
  profissional text not null default '',
  modalidade text not null default 'online'
    check (modalidade in ('online', 'presencial')),
  local text not null default '',
  data date not null,
  hora time not null,
  duracao_min int not null default 30 check (duracao_min > 0),
  vagas int not null default 1 check (vagas >= 1),
  observacao text not null default '',
  publicado boolean not null default true,
  criado_por uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_consultas_horarios_quando
  on public.consultas_horarios (data, hora);

-- ---------- consultas_agendadas ----------
-- Quem pegou cada horário.

create table if not exists public.consultas_agendadas (
  id uuid primary key default gen_random_uuid(),
  horario_id uuid not null references public.consultas_horarios(id) on delete cascade,
  fiel_id uuid not null references public.profiles(id) on delete cascade,
  -- Copiados na hora de marcar, de propósito: a equipe liga para confirmar.
  nome text not null default '',
  telefone text not null default '',
  motivo text not null default '',
  status text not null default 'marcada'
    check (status in ('marcada', 'cancelada', 'atendida', 'faltou')),
  criado_em timestamptz not null default now()
);

-- Uma marcação ativa por pessoa em cada horário.
create unique index if not exists idx_consultas_uma_por_pessoa
  on public.consultas_agendadas (horario_id, fiel_id)
  where status = 'marcada';

create index if not exists idx_consultas_agendadas_fiel
  on public.consultas_agendadas (fiel_id, criado_em desc);

-- ---------- view consultas_abertas ----------
-- Mostra quantas vagas sobraram sem expor nomes.

create or replace view public.consultas_abertas as
  select
    h.id,
    h.especialidade,
    h.profissional,
    h.modalidade,
    h.local,
    h.data,
    h.hora,
    h.duracao_min,
    h.vagas,
    h.observacao,
    h.vagas - coalesce(m.ocupadas, 0) as restantes
  from public.consultas_horarios h
  left join (
    select horario_id, count(*) as ocupadas
      from public.consultas_agendadas
     where status = 'marcada'
     group by horario_id
  ) m on m.horario_id = h.id
  where h.publicado;

grant select on public.consultas_abertas to authenticated;

-- ---------- função agendar_consulta ----------
-- Única porta para INSERT (não há RLS de insert). Trava a linha do horário
-- antes de contar vagas para evitar corrida.

create or replace function public.agendar_consulta(
  p_horario uuid,
  p_nome text default '',
  p_telefone text default '',
  p_motivo text default ''
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.consultas_horarios%rowtype;
  ocupadas int;
begin
  if auth.uid() is null then
    return 'sem_conta';
  end if;

  select * into h from public.consultas_horarios where id = p_horario for update;
  if not found or not h.publicado then
    return 'indisponivel';
  end if;

  if (h.data + h.hora) < (now() at time zone 'America/Sao_Paulo') then
    return 'passou';
  end if;

  if exists (
    select 1 from public.consultas_agendadas
     where horario_id = p_horario and fiel_id = auth.uid() and status = 'marcada'
  ) then
    return 'ja_marcada';
  end if;

  select count(*) into ocupadas
    from public.consultas_agendadas
   where horario_id = p_horario and status = 'marcada';
  if ocupadas >= h.vagas then
    return 'lotado';
  end if;

  insert into public.consultas_agendadas (horario_id, fiel_id, nome, telefone, motivo)
  values (
    p_horario,
    auth.uid(),
    coalesce(nullif(btrim(p_nome), ''),
             (select nome from public.profiles where id = auth.uid()),
             ''),
    coalesce(p_telefone, ''),
    coalesce(p_motivo, '')
  );
  return 'ok';
end;
$$;

revoke all on function public.agendar_consulta(uuid, text, text, text) from public;
grant execute on function public.agendar_consulta(uuid, text, text, text) to authenticated;

-- ---------- RLS ----------

alter table public.consultas_horarios  enable row level security;
alter table public.consultas_agendadas enable row level security;

do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('consultas_horarios','consultas_agendadas')
  loop
    execute format('drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- consultas_horarios: autenticado lê publicados; super_admin gerencia
create policy "horarios: autenticado lê publicados"
  on public.consultas_horarios for select to authenticated
  using (publicado = true);

create policy "horarios: super_admin lê todos"
  on public.consultas_horarios for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

create policy "horarios: super_admin gerencia"
  on public.consultas_horarios for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin');

grant select on public.consultas_horarios to authenticated;

-- consultas_agendadas: cada fiel vê a sua; desmarcar permitido; super_admin tudo
create policy "agendadas: fiel vê as suas"
  on public.consultas_agendadas for select to authenticated
  using (fiel_id = auth.uid());

create policy "agendadas: super_admin lê todas"
  on public.consultas_agendadas for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- Desmarcar: fiel pode mudar status para 'cancelada'; não há política de INSERT
-- (só via função agendar_consulta).
create policy "agendadas: fiel desmarca"
  on public.consultas_agendadas for update to authenticated
  using (fiel_id = auth.uid() and status = 'marcada')
  with check (fiel_id = auth.uid() and status = 'cancelada');

create policy "agendadas: super_admin gerencia"
  on public.consultas_agendadas for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'super_admin');

grant select, update on public.consultas_agendadas to authenticated;
