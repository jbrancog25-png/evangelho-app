import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { ConsultaMinha, HorarioConsulta } from './tipos'

/** Horários abertos (view consultas_abertas), já com restantes calculados. */
export function useHorariosConsulta() {
  const [data, setData] = useState<HorarioConsulta[]>([])
  const [brutos, setBrutos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    const hoje = new Date().toISOString().slice(0, 10)
    const { data: rows, error: err } = await supabase
      .from('consultas_abertas')
      .select('*')
      .gte('data', hoje)
      .order('data', { ascending: true })
      .order('hora', { ascending: true })
    setLoading(false)
    if (err) {
      setError(explicar(err.message))
      return
    }
    const lista = (rows ?? []) as HorarioConsulta[]
    setBrutos(lista.length)
    setData(lista.filter((h) => h.restantes > 0))
  }, [])

  useEffect(() => { reload() }, [reload])

  return { data, brutos, loading, error, reload }
}

/** Consultas marcadas pelo fiel logado. */
export function useMinhasConsultas(logado: boolean) {
  const [data, setData] = useState<ConsultaMinha[]>([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!logado) {
      setData([])
      return
    }
    setLoading(true)
    const { data: rows } = await supabase
      .from('consultas_agendadas')
      .select('id, horario_id, nome, telefone, motivo, status, criado_em')
      .order('criado_em', { ascending: false })
    const lista = (rows ?? []) as ConsultaMinha[]

    // Enriquece com dados do horário em batch
    const ids = Array.from(new Set(lista.map((c) => c.horario_id)))
    if (ids.length > 0) {
      const { data: hs } = await supabase
        .from('consultas_abertas')
        .select('*')
        .in('id', ids)
      const mapa = new Map<string, HorarioConsulta>()
      ;(hs ?? []).forEach((h) => mapa.set(h.id, h as HorarioConsulta))
      lista.forEach((c) => { c.horario = mapa.get(c.horario_id) ?? null })
    }

    setData(lista)
    setLoading(false)
  }, [logado])

  useEffect(() => { reload() }, [reload])

  return { data, loading, reload }
}

export async function marcarConsulta(
  horarioId: string,
  dados: { nome: string; telefone: string; motivo: string },
): Promise<{ ok: boolean; recado: string }> {
  const { data, error } = await supabase.rpc('agendar_consulta', {
    p_horario: horarioId,
    p_nome: dados.nome,
    p_telefone: dados.telefone,
    p_motivo: dados.motivo,
  })
  if (error) return { ok: false, recado: explicar(error.message) }
  const codigo = (data as string) ?? 'erro'
  const mensagens: Record<string, string> = {
    ok: 'Consulta marcada! A equipe liga para confirmar.',
    sem_conta: 'Entre na sua conta para marcar.',
    indisponivel: 'Esse horário não está mais disponível.',
    passou: 'Esse horário já passou.',
    ja_marcada: 'Você já tem uma marcação para esse horário.',
    lotado: 'Esse horário acabou de lotar. Escolha outro.',
  }
  return { ok: codigo === 'ok', recado: mensagens[codigo] ?? 'Não deu para marcar.' }
}

export async function desmarcarConsulta(id: string): Promise<string | null> {
  const { error } = await supabase
    .from('consultas_agendadas')
    .update({ status: 'cancelada' })
    .eq('id', id)
  return error ? explicar(error.message) : null
}

function explicar(msg: string): string {
  if (/relation .* does not exist/i.test(msg)) return 'A tabela de consultas ainda não existe no banco.'
  if (/permission denied/i.test(msg)) return 'Você não tem permissão para isso.'
  return msg
}
