import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Louvor } from '../lib/tipos'

export default function AdminLouvores() {
  const { profile } = useAuth()
  const [louvores, setLouvores] = useState<Louvor[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('louvores').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setLouvores(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(l: Louvor) {
    await supabase.from('louvores').update({ publicado: !l.publicado }).eq('id', l.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('louvores').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Louvores</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormLouvor autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && louvores.length === 0 && <p className="admin__vazio">Nenhum louvor.</p>}

      <ul className="admin__lista">
        {louvores.map((l) => (
          <li key={l.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{l.titulo}</p>
                <p className="admin__item-meta">
                  {l.artista ?? '—'}
                  {l.playlist ? ` · ${l.playlist}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${l.publicado ? 'aprovada' : 'pendente'}`}>
                {l.publicado ? 'publicado' : 'rascunho'}
              </span>
            </div>
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(l)}>
                {l.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(l.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormLouvor({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [artista, setArtista] = useState('')
  const [url, setUrl] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [playlist, setPlaylist] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('louvores').insert({
      titulo,
      artista: artista || null,
      url,
      imagem_url: imagemUrl || null,
      playlist: playlist || null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
      <label className="auth__campo"><span>Artista</span><input value={artista} onChange={(e) => setArtista(e.target.value)} /></label>
      <label className="auth__campo"><span>URL (YouTube, Spotify, etc.)</span><input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></label>
      <label className="auth__campo"><span>Imagem/capa (URL)</span><input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} /></label>
      <label className="auth__campo"><span>Playlist (opcional)</span><input value={playlist} onChange={(e) => setPlaylist(e.target.value)} placeholder="Adoração, Jovem…" /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar louvor (rascunho)'}
      </button>
    </form>
  )
}
