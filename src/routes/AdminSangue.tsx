import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { CampanhaSangue, UrgenciaSangue } from '../lib/tipos'

const URGENCIAS: UrgenciaSangue[] = ['baixa', 'media', 'alta', 'critica']

export default function AdminSangue() {
  const { profile } = useAuth()
  const [itens, setItens] = useState<CampanhaSangue[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('campanhas_sangue').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setItens(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(c: CampanhaSangue) {
    await supabase.from('campanhas_sangue').update({ publicado: !c.publicado }).eq('id', c.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('campanhas_sangue').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Campanhas de doação de sangue</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormSangue autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && itens.length === 0 && <p className="admin__vazio">Nenhuma campanha.</p>}

      <ul className="admin__lista">
        {itens.map((c) => (
          <li key={c.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{c.hospital}</p>
                <p className="admin__item-meta">
                  {c.cidade}/{c.estado ?? ''}
                  {c.tipos_sanguineos ? ` · ${c.tipos_sanguineos}` : ''}
                  {' · '}urgência: {c.urgencia}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${c.publicado ? 'aprovada' : 'pendente'}`}>
                {c.publicado ? 'publicada' : 'rascunho'}
              </span>
            </div>
            {c.descricao && <p className="palavra__texto">{c.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(c)}>
                {c.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(c.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormSangue({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [hospital, setHospital] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipos, setTipos] = useState('')
  const [urgencia, setUrgencia] = useState<UrgenciaSangue>('media')
  const [descricao, setDescricao] = useState('')
  const [link, setLink] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('campanhas_sangue').insert({
      hospital, cidade,
      tipos_sanguineos: tipos || null,
      urgencia,
      descricao: descricao || null,
      link_agendamento: link || null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Hospital</span><input required value={hospital} onChange={(e) => setHospital(e.target.value)} /></label>
      <label className="auth__campo"><span>Cidade</span><input required value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      <label className="auth__campo"><span>Tipos sanguíneos necessários</span><input value={tipos} onChange={(e) => setTipos(e.target.value)} placeholder="A+, O-, B+" /></label>
      <label className="auth__campo"><span>Urgência</span>
        <select value={urgencia} onChange={(e) => setUrgencia(e.target.value as UrgenciaSangue)}>
          {URGENCIAS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Link de agendamento</span><input value={link} onChange={(e) => setLink(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar campanha (rascunho)'}
      </button>
    </form>
  )
}
