import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Campanha, Igreja } from '../lib/tipos'

export default function AdminCampanhas() {
  const { profile } = useAuth()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const [{ data: cs, error: eCs }, { data: igs }] = await Promise.all([
      supabase.from('campanhas').select('*').order('criada_em', { ascending: false }),
      supabase.from('igrejas').select('*').eq('status', 'aprovada').order('nome'),
    ])
    setCarregando(false)
    if (eCs) setErro(eCs.message)
    else setCampanhas(cs ?? [])
    setIgrejas(igs ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(c: Campanha) {
    await supabase.from('campanhas').update({ publicada: !c.publicada }).eq('id', c.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('campanhas').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Campanhas</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormCampanha
          igrejas={igrejas}
          autorId={profile.id}
          onSalvo={() => { setMostrarForm(false); carregar() }}
        />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && campanhas.length === 0 && <p className="admin__vazio">Nenhuma campanha.</p>}

      <ul className="admin__lista">
        {campanhas.map((c) => (
          <li key={c.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{c.titulo}</p>
                <p className="admin__item-meta">
                  {c.escopo === 'geral' ? 'geral' : 'da igreja'} · cor: {c.cor}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${c.publicada ? 'aprovada' : 'pendente'}`}>
                {c.publicada ? 'publicada' : 'rascunho'}
              </span>
            </div>
            {c.descricao && <p className="palavra__texto">{c.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(c)}>
                {c.publicada ? 'Despublicar' : 'Publicar'}
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

function FormCampanha({ igrejas, autorId, onSalvo }: { igrejas: Igreja[]; autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cor, setCor] = useState<Campanha['cor']>('dourado')
  const [cta, setCta] = useState('')
  const [link, setLink] = useState('')
  const [escopo, setEscopo] = useState<'geral' | 'igreja'>('geral')
  const [igrejaId, setIgrejaId] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [ativaAte, setAtivaAte] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('campanhas').insert({
      titulo,
      descricao: descricao || null,
      cor,
      call_to_action: cta || null,
      link: link || null,
      escopo,
      igreja_id: escopo === 'igreja' ? igrejaId : null,
      imagem_url: imagemUrl || null,
      ativa_ate: ativaAte ? new Date(ativaAte).toISOString() : null,
      publicada: true,
      criada_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Cor</span>
        <select value={cor} onChange={(e) => setCor(e.target.value as Campanha['cor'])}>
          <option value="dourado">Dourado</option>
          <option value="azul">Azul</option>
          <option value="verde">Verde</option>
          <option value="ambar">Âmbar</option>
        </select>
      </label>
      <label className="auth__campo"><span>Call-to-action (texto do botão)</span>
        <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Participar, Doar…" />
      </label>
      <label className="auth__campo"><span>Link (opcional)</span>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
      </label>
      <label className="auth__campo"><span>Imagem (URL opcional)</span>
        <input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Ativa até (opcional)</span>
        <input type="datetime-local" value={ativaAte} onChange={(e) => setAtivaAte(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Escopo</span>
        <select value={escopo} onChange={(e) => setEscopo(e.target.value as 'geral' | 'igreja')}>
          <option value="geral">Geral</option>
          <option value="igreja">De uma igreja</option>
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
        {enviando ? 'Salvando…' : 'Publicar campanha'}
      </button>
    </form>
  )
}
