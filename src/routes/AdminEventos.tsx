import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Evento, EventoCategoria, Igreja } from '../lib/tipos'

const CATEGORIAS: EventoCategoria[] = [
  'cultural', 'esportivo', 'educativo', 'solidario',
  'saude', 'missao', 'show', 'curso', 'outros',
]

export default function AdminEventos() {
  const { profile } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    const [{ data: evs, error: errEv }, { data: igs }] = await Promise.all([
      supabase.from('eventos').select('*').order('data_inicio', { ascending: true }),
      supabase.from('igrejas').select('*').eq('status', 'aprovada').order('nome'),
    ])
    setCarregando(false)
    if (errEv) setErro(errEv.message)
    else setEventos(evs ?? [])
    setIgrejas(igs ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternarPublicado(e: Evento) {
    await supabase.from('eventos').update({ publicado: !e.publicado }).eq('id', e.id)
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover este evento?')) return
    await supabase.from('eventos').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Eventos</h2>
        <button
          type="button"
          className="botao botao--primario botao--compacto"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormEvento
          igrejas={igrejas}
          autorId={profile.id}
          onSalvo={() => { setMostrarForm(false); carregar() }}
        />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && eventos.length === 0 && <p className="admin__vazio">Nenhum evento cadastrado.</p>}

      <ul className="admin__lista">
        {eventos.map((ev) => (
          <li key={ev.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{ev.titulo}</p>
                <p className="admin__item-meta">
                  {formatarData(ev.data_inicio)}
                  {ev.cidade ? ` · ${ev.cidade}/${ev.estado ?? 'SP'}` : ''}
                  {' · '}{ev.categoria}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${ev.publicado ? 'aprovada' : 'pendente'}`}>
                {ev.publicado ? 'publicado' : 'rascunho'}
              </span>
            </div>
            {ev.descricao && <p className="palavra__texto">{ev.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternarPublicado(ev)}>
                {ev.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(ev.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormEvento({
  igrejas, autorId, onSalvo,
}: { igrejas: Igreja[]; autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [local, setLocal] = useState('')
  const [cidade, setCidade] = useState('')
  const [categoria, setCategoria] = useState<EventoCategoria>('cultural')
  const [escopo, setEscopo] = useState<'geral' | 'igreja'>('geral')
  const [igrejaId, setIgrejaId] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('eventos').insert({
      titulo,
      descricao: descricao || null,
      data_inicio: new Date(dataInicio).toISOString(),
      local: local || null,
      cidade: cidade || null,
      categoria,
      imagem_url: imagemUrl || null,
      escopo,
      igreja_id: escopo === 'igreja' ? igrejaId : null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span>
        <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Descrição</span>
        <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Data e hora</span>
        <input type="datetime-local" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Local</span>
        <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Templo central" />
      </label>
      <label className="auth__campo"><span>Cidade</span>
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Categoria</span>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as EventoCategoria)}>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Imagem (URL opcional)</span>
        <input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://…" />
      </label>
      <label className="auth__campo"><span>Escopo</span>
        <select value={escopo} onChange={(e) => setEscopo(e.target.value as 'geral' | 'igreja')}>
          <option value="geral">Geral (todos os fiéis)</option>
          <option value="igreja">De uma igreja específica</option>
        </select>
      </label>
      {escopo === 'igreja' && (
        <label className="auth__campo"><span>Igreja</span>
          <select required value={igrejaId} onChange={(e) => setIgrejaId(e.target.value)}>
            <option value="">— selecione —</option>
            {igrejas.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </label>
      )}
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar evento (como rascunho)'}
      </button>
    </form>
  )
}

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
