import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { DIAS_SEMANA, type Culto, type Igreja, type Palavra, type PedidoOracao } from '../lib/tipos'
import './Admin.css'
import './PastorIgreja.css'

type Aba = 'palavra' | 'cultos' | 'oracao'

export default function PastorIgreja() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [igreja, setIgreja] = useState<Igreja | null>(null)
  const [aba, setAba] = useState<Aba>('palavra')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('igrejas')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setErro(error.message)
        else setIgreja(data)
      })
  }, [id])

  if (!id) return null
  if (erro) return <p className="auth__erro">{erro}</p>
  if (!igreja) return <p className="admin__vazio">Carregando…</p>

  return (
    <div className="admin">
      <header className="admin__topo">
        <Link to="/pastor" className="feed__voltar" aria-label="Voltar">
          ‹
        </Link>
      </header>

      <div>
        <h2 className="admin__secao-titulo">{igreja.nome}</h2>
        <p className="admin__item-meta">{igreja.cidade}/{igreja.estado}</p>
      </div>

      <nav className="admin__nav">
        <button
          type="button"
          className={`admin__nav-item${aba === 'palavra' ? ' active' : ''}`}
          onClick={() => setAba('palavra')}
        >
          Palavra
        </button>
        <button
          type="button"
          className={`admin__nav-item${aba === 'cultos' ? ' active' : ''}`}
          onClick={() => setAba('cultos')}
        >
          Cultos
        </button>
        <button
          type="button"
          className={`admin__nav-item${aba === 'oracao' ? ' active' : ''}`}
          onClick={() => setAba('oracao')}
        >
          Orações
        </button>
      </nav>

      <main className="admin__main">
        {aba === 'palavra' && profile && <SecaoPalavra igrejaId={id} autorId={profile.id} />}
        {aba === 'cultos' && <SecaoCultos igrejaId={id} />}
        {aba === 'oracao' && <SecaoOracao igrejaId={id} />}
      </main>
    </div>
  )
}

/* -------------------- Palavra -------------------- */

function SecaoPalavra({ igrejaId, autorId }: { igrejaId: string; autorId: string }) {
  const [texto, setTexto] = useState('')
  const [historico, setHistorico] = useState<Palavra[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    const { data, error } = await supabase
      .from('palavras')
      .select('*')
      .eq('igreja_id', igrejaId)
      .order('criada_em', { ascending: false })
      .limit(10)
    if (error) setErro(error.message)
    else setHistorico(data ?? [])
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igrejaId])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    setErro(null)
    const { error } = await supabase.from('palavras').insert({
      igreja_id: igrejaId,
      autor_id: autorId,
      texto: texto.trim(),
    })
    setEnviando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setTexto('')
    carregar()
  }

  async function remover(palavraId: string) {
    if (!confirm('Remover esta palavra?')) return
    await supabase.from('palavras').delete().eq('id', palavraId)
    carregar()
  }

  return (
    <section>
      <form onSubmit={salvar} className="auth__form">
        <label className="auth__campo">
          <span>Nova palavra da semana</span>
          <textarea
            rows={4}
            required
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma mensagem curta de edificação para os fiéis…"
          />
        </label>
        {erro && <p className="auth__erro">{erro}</p>}
        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar palavra'}
        </button>
      </form>

      <h3 className="admin__secao-titulo" style={{ marginTop: 16, fontSize: 15 }}>Histórico</h3>
      {historico.length === 0 && <p className="admin__vazio">Nenhuma palavra publicada ainda.</p>}
      <ul className="admin__lista">
        {historico.map((p) => (
          <li key={p.id} className="admin__item">
            <p className="palavra__texto">{p.texto}</p>
            <div className="admin__item-cab" style={{ alignItems: 'center' }}>
              <span className="admin__item-meta">{formatarData(p.criada_em)}</span>
              <button
                type="button"
                onClick={() => remover(p.id)}
                className="botao botao--ghost botao--compacto"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------- Cultos -------------------- */

function SecaoCultos({ igrejaId }: { igrejaId: string }) {
  const [cultos, setCultos] = useState<Culto[]>([])
  const [diaSemana, setDiaSemana] = useState<number>(0)
  const [hora, setHora] = useState('18:30')
  const [local, setLocal] = useState('')
  const [recorrencia, setRecorrencia] = useState<Culto['recorrencia']>('semanal')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    const { data, error } = await supabase
      .from('cultos')
      .select('*')
      .eq('igreja_id', igrejaId)
      .order('dia_semana')
      .order('hora')
    if (error) setErro(error.message)
    else setCultos(data ?? [])
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igrejaId])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    const { error } = await supabase.from('cultos').insert({
      igreja_id: igrejaId,
      dia_semana: diaSemana,
      hora,
      local: local || null,
      recorrencia,
    })
    setEnviando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setLocal('')
    carregar()
  }

  async function remover(cultoId: string) {
    if (!confirm('Remover este culto?')) return
    await supabase.from('cultos').delete().eq('id', cultoId)
    carregar()
  }

  return (
    <section>
      <form onSubmit={salvar} className="auth__form">
        <label className="auth__campo">
          <span>Dia da semana</span>
          <select value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value))}>
            {DIAS_SEMANA.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </label>
        <label className="auth__campo">
          <span>Horário</span>
          <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} />
        </label>
        <label className="auth__campo">
          <span>Local (opcional)</span>
          <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Templo central" />
        </label>
        <label className="auth__campo">
          <span>Recorrência</span>
          <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value as Culto['recorrencia'])}>
            <option value="semanal">Semanal</option>
            <option value="quinzenal">Quinzenal</option>
            <option value="mensal">Mensal</option>
            <option value="avulso">Avulso</option>
          </select>
        </label>
        {erro && <p className="auth__erro">{erro}</p>}
        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Adicionar culto'}
        </button>
      </form>

      <h3 className="admin__secao-titulo" style={{ marginTop: 16, fontSize: 15 }}>Cultos cadastrados</h3>
      {cultos.length === 0 && <p className="admin__vazio">Nenhum culto cadastrado.</p>}
      <ul className="admin__lista">
        {cultos.map((c) => (
          <li key={c.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">
                  {DIAS_SEMANA[c.dia_semana]} · {c.hora.substring(0, 5)}
                </p>
                <p className="admin__item-meta">
                  {c.recorrencia}
                  {c.local ? ` · ${c.local}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remover(c.id)}
                className="botao botao--ghost botao--compacto"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------- Pedidos de oração -------------------- */

function SecaoOracao({ igrejaId }: { igrejaId: string }) {
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([])
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    const { data, error } = await supabase
      .from('pedidos_oracao')
      .select('*')
      .eq('igreja_id', igrejaId)
      .order('criado_em', { ascending: false })
    if (error) setErro(error.message)
    else setPedidos(data ?? [])
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igrejaId])

  async function alternar(p: PedidoOracao, campo: 'publicado' | 'arquivado') {
    await supabase.from('pedidos_oracao').update({ [campo]: !p[campo] }).eq('id', p.id)
    carregar()
  }

  async function remover(pedidoId: string) {
    if (!confirm('Remover este pedido?')) return
    await supabase.from('pedidos_oracao').delete().eq('id', pedidoId)
    carregar()
  }

  if (erro) return <p className="auth__erro">{erro}</p>

  return (
    <section>
      <p className="admin__item-meta">
        Pedidos chegam dos fiéis que seguem sua igreja. Publique para a comunidade poder orar junto; arquive quando a oração for respondida.
      </p>

      {pedidos.length === 0 && <p className="admin__vazio">Nenhum pedido ainda.</p>}

      <ul className="admin__lista">
        {pedidos.map((p) => (
          <li key={p.id} className="admin__item">
            <p className="palavra__texto">{p.texto}</p>
            <p className="admin__item-meta">
              {p.anonimo ? 'Anônimo' : (p.autor_nome ?? '—')} · {formatarData(p.criado_em)}
              {' · '}
              <span className={`admin__badge admin__badge--${p.publicado ? 'aprovada' : 'pendente'}`}>
                {p.publicado ? 'publicado' : 'rascunho'}
              </span>
              {p.arquivado && (
                <span className="admin__badge admin__badge--rejeitada" style={{ marginLeft: 6 }}>
                  arquivado
                </span>
              )}
            </p>
            <div className="admin__item-acoes">
              <button
                type="button"
                className="botao botao--primario"
                onClick={() => alternar(p, 'publicado')}
              >
                {p.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                type="button"
                className="botao botao--ghost"
                onClick={() => alternar(p, 'arquivado')}
              >
                {p.arquivado ? 'Desarquivar' : 'Arquivar'}
              </button>
              <button
                type="button"
                className="botao botao--ghost"
                onClick={() => remover(p.id)}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
