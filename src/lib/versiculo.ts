import { supabase } from './supabase'
import { hojeLocal } from './datas'

export type VersiculoDoDia = { texto: string; referencia: string }

/**
 * O versículo do dia.
 *
 * Antes só aparecia o marcado exatamente para hoje — e, num dia em que
 * ninguém marcou, a Bíblia e o Início ficavam sem versículo. Agora, nesta
 * ordem: o marcado para hoje; senão, o último marcado antes de hoje; senão,
 * um dos cadastrados, que muda a cada dia.
 */
export async function lerVersiculoDoDia(): Promise<VersiculoDoDia | null> {
  const hoje = hojeLocal()

  const marcado = await supabase
    .from('versiculos')
    .select('texto, referencia')
    .lte('do_dia_em', hoje)
    .order('do_dia_em', { ascending: false })
    .limit(1)
  const ultimo = (marcado.data ?? [])[0] as VersiculoDoDia | undefined
  if (ultimo) return ultimo

  const todos = await supabase.from('versiculos').select('texto, referencia').order('criado_em').limit(366)
  const lista = (todos.data ?? []) as VersiculoDoDia[]
  if (!lista.length) return null
  const dia = Math.floor(Date.parse(`${hoje}T12:00:00Z`) / 86_400_000)
  return lista[dia % lista.length]
}
