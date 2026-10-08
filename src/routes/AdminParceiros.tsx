import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Parceiro, ParceiroTipo } from '../lib/tipos'

const TIPOS: ParceiroTipo[] = ['igreja', 'ong', 'comercio', 'escola', 'publico', 'outro']

export default function AdminParceiros() {
  const { profile } = useAuth()
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('parceiros').select('*').order('nome')
    setCarregando(false)
    if (error) setErro(error.message)
    else setParceiros(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(p: Parceiro) {
    await supabase.from('parceiros').update({ publicado: !p.publicado }).eq('id', p.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('parceiros').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Entidades parceiras</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormParceiro autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && parceiros.length === 0 && <p className="admin__vazio">Nenhum parceiro.</p>}

      <ul className="admin__lista">
        {parceiros.map((p) => (
          <li key={p.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{p.nome}</p>
                <p className="admin__item-meta">
                  {p.tipo}
                  {p.cidade ? ` · ${p.cidade}/${p.estado ?? ''}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${p.publicado ? 'aprovada' : 'pendente'}`}>
                {p.publicado ? 'publicado' : 'rascunho'}
              </span>
            </div>
            {p.descricao && <p className="palavra__texto">{p.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(p)}>
                {p.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(p.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormParceiro({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<ParceiroTipo>('ong')
  const [logoUrl, setLogoUrl] = useState('')
  const [link, setLink] = useState('')
  const [cidade, setCidade] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('parceiros').insert({
      nome,
      descricao: descricao || null,
      tipo,
      logo_url: logoUrl || null,
      link: link || null,
      cidade: cidade || null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Nome</span><input required value={nome} onChange={(e) => setNome(e.target.value)} /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Tipo</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as ParceiroTipo)}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Logo (URL)</span><input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} /></label>
      <label className="auth__campo"><span>Link / site</span><input value={link} onChange={(e) => setLink(e.target.value)} /></label>
      <label className="auth__campo"><span>Cidade</span><input value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar parceiro (rascunho)'}
      </button>
    </form>
  )
}
