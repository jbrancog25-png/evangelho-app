import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Igreja, IgrejaStatus } from '../lib/tipos'

const filtros: Array<{ status: IgrejaStatus | 'todas'; rotulo: string }> = [
  { status: 'pendente', rotulo: 'Pendentes' },
  { status: 'aprovada', rotulo: 'Aprovadas' },
  { status: 'rejeitada', rotulo: 'Rejeitadas' },
  { status: 'todas', rotulo: 'Todas' },
]

export default function AdminIgrejas() {
  const { profile } = useAuth()
  const [filtro, setFiltro] = useState<IgrejaStatus | 'todas'>('pendente')
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    let query = supabase.from('igrejas').select('*').order('criada_em', { ascending: false })
    if (filtro !== 'todas') query = query.eq('status', filtro)
    const { data, error } = await query
    setCarregando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setIgrejas(data ?? [])
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  async function aprovar(igreja: Igreja) {
    const { error } = await supabase
      .from('igrejas')
      .update({
        status: 'aprovada',
        aprovada_em: new Date().toISOString(),
        aprovada_por: profile?.id,
        motivo_rejeicao: null,
      })
      .eq('id', igreja.id)
    if (error) {
      alert('Erro ao aprovar: ' + error.message)
      return
    }
    carregar()
  }

  async function rejeitar(igreja: Igreja) {
    const motivo = window.prompt('Motivo da rejeição (opcional):', '')
    if (motivo === null) return
    const { error } = await supabase
      .from('igrejas')
      .update({ status: 'rejeitada', motivo_rejeicao: motivo || null })
      .eq('id', igreja.id)
    if (error) {
      alert('Erro ao rejeitar: ' + error.message)
      return
    }
    carregar()
  }

  return (
    <section>
      <h2 className="admin__secao-titulo">Igrejas cadastradas</h2>

      <div className="admin__filtros">
        {filtros.map(({ status, rotulo }) => (
          <button
            key={status}
            type="button"
            onClick={() => setFiltro(status)}
            className={`admin__filtro${filtro === status ? ' admin__filtro--ativo' : ''}`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && igrejas.length === 0 && <p className="admin__vazio">Nenhuma igreja neste filtro.</p>}

      <ul className="admin__lista">
        {igrejas.map((igreja) => (
          <li key={igreja.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{igreja.nome}</p>
                <p className="admin__item-meta">
                  {igreja.cidade}/{igreja.estado}
                  {igreja.endereco ? ` · ${igreja.endereco}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${igreja.status}`}>{igreja.status}</span>
            </div>

            {igreja.motivo_rejeicao && (
              <p className="admin__item-meta">Motivo: {igreja.motivo_rejeicao}</p>
            )}

            {igreja.status === 'pendente' && (
              <div className="admin__item-acoes">
                <button type="button" className="botao botao--primario" onClick={() => aprovar(igreja)}>
                  Aprovar
                </button>
                <button type="button" className="botao botao--ghost" onClick={() => rejeitar(igreja)}>
                  Rejeitar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
