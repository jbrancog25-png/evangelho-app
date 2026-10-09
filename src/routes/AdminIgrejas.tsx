import { useEffect, useState, type FormEvent } from 'react'
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
  const [mostrarForm, setMostrarForm] = useState(false)
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
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Igrejas cadastradas</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova igreja'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormNovaIgreja autorId={profile.id} onSalvo={() => { setMostrarForm(false); setFiltro('aprovada'); carregar() }} />
      )}

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

function FormNovaIgreja({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')
  const [endereco, setEndereco] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)

    // 1) Insere como pendente (RLS do super_admin permite)
    const { data: ig, error: errIns } = await supabase.from('igrejas').insert({
      nome, cidade, estado,
      endereco: endereco || null,
      criada_por: autorId,
      status: 'pendente',
    }).select().single()

    if (errIns) {
      setEnviando(false)
      setErro(errIns.message)
      return
    }

    // 2) Já aprova (super_admin pode atualizar status)
    const { error: errUp } = await supabase.from('igrejas').update({
      status: 'aprovada',
      aprovada_em: new Date().toISOString(),
      aprovada_por: autorId,
    }).eq('id', ig.id)

    setEnviando(false)
    if (errUp) {
      setErro('Igreja criada mas falhou ao aprovar: ' + errUp.message)
      return
    }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Nome da igreja</span>
        <input required value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Cidade</span>
        <input required value={cidade} onChange={(e) => setCidade(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Estado (UF)</span>
        <input maxLength={2} required value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} />
      </label>
      <label className="auth__campo"><span>Endereço (opcional)</span>
        <input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
      </label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Criando…' : 'Criar e aprovar'}
      </button>
    </form>
  )
}
