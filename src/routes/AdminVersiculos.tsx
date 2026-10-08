import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Versiculo } from '../lib/tipos'

export default function AdminVersiculos() {
  const { profile } = useAuth()
  const [versiculos, setVersiculos] = useState<Versiculo[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('versiculos').select('*').order('do_dia_em', { ascending: false, nullsFirst: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setVersiculos(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function marcarDoDia(v: Versiculo) {
    const hoje = new Date().toISOString().slice(0, 10)
    // Primeiro desmarca qualquer um de hoje
    await supabase.from('versiculos').update({ do_dia_em: null }).eq('do_dia_em', hoje)
    // Depois marca este
    const { error } = await supabase.from('versiculos').update({ do_dia_em: hoje }).eq('id', v.id)
    if (error) { setErro(error.message); return }
    carregar()
  }

  async function desmarcar(v: Versiculo) {
    await supabase.from('versiculos').update({ do_dia_em: null }).eq('id', v.id)
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('versiculos').delete().eq('id', id)
    carregar()
  }

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Versículos</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormVersiculo autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && versiculos.length === 0 && <p className="admin__vazio">Nenhum versículo.</p>}

      <ul className="admin__lista">
        {versiculos.map((v) => {
          const ehDoDia = v.do_dia_em === hoje
          return (
            <li key={v.id} className="admin__item">
              <p className="palavra__texto">“{v.texto}”</p>
              <div className="admin__item-cab">
                <p className="admin__item-meta">
                  <strong style={{ color: 'var(--dourado-claro)' }}>{v.referencia}</strong>
                  {v.do_dia_em && (
                    <span className={`admin__badge admin__badge--${ehDoDia ? 'aprovada' : 'pendente'}`} style={{ marginLeft: 8 }}>
                      {ehDoDia ? 'HOJE' : v.do_dia_em}
                    </span>
                  )}
                </p>
              </div>
              <div className="admin__item-acoes">
                {ehDoDia ? (
                  <button type="button" className="botao botao--ghost" onClick={() => desmarcar(v)}>
                    Desmarcar do dia
                  </button>
                ) : (
                  <button type="button" className="botao botao--primario" onClick={() => marcarDoDia(v)}>
                    Marcar como "do dia"
                  </button>
                )}
                <button type="button" className="botao botao--ghost" onClick={() => remover(v.id)}>
                  Remover
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function FormVersiculo({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [texto, setTexto] = useState('')
  const [referencia, setReferencia] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('versiculos').insert({
      texto: texto.trim(), referencia: referencia.trim(), criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    setTexto(''); setReferencia('')
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Texto</span>
        <textarea rows={3} required value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Tua palavra é lâmpada…" />
      </label>
      <label className="auth__campo"><span>Referência</span>
        <input required value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Salmos 119:105" />
      </label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Salvar versículo'}
      </button>
    </form>
  )
}
