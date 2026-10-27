import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Louvor } from '../lib/tipos'
import { useAuth } from '../hooks/useAuth'
import { useTocador } from '../hooks/useTocador'
import { paginaDoSoundCloud, playlistDoSoundCloud, type Playlist } from '../lib/soundcloud'
import './Feed.css'

/** Um louvor do painel com link do SoundCloud vira uma playlist no player. */
function comoPlaylist(l: Louvor): Playlist {
  return {
    id: l.id,
    titulo: l.titulo,
    url: l.url,
    pagina: paginaDoSoundCloud(l.url),
    autor: l.artista ?? '',
    descricao: l.playlist ?? '',
  }
}

/**
 * Louvores: música gospel pelo player do SoundCloud, como no Evangelho antigo.
 *
 * Esta tela é só a moldura — título, texto e a escolha da playlist. O player
 * mora em `TocadorLouvores`, no App, para a música continuar tocando quando o
 * fiel vai para outra tela.
 *
 * Toda playlist sai do painel admin (/admin/louvores). Antes havia uma
 * PLAYLIST_PADRAO hardcoded, mas o canal público sumiu e o widget quebrou —
 * agora, se o painel está vazio, a tela explica isso em vez de mostrar erro
 * do SoundCloud. Louvores de outros sites (YouTube, Spotify…) aparecem
 * embaixo, com o botão "Ouvir".
 */
export default function FielLouvores() {
  const { profile } = useAuth()
  const { tocando, tocar } = useTocador()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [outros, setOutros] = useState<Louvor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('louvores')
      .select('*')
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        const lista = (data ?? []) as Louvor[]
        const doSoundCloud = lista.filter((l) => playlistDoSoundCloud(l.url))
        setPlaylists(doSoundCloud.map(comoPlaylist))
        setOutros(lista.filter((l) => !playlistDoSoundCloud(l.url)))
      })
  }, [])

  // Abriu Louvores: monta o player com a primeira playlist. Daí em diante ele
  // fica montado, e a música segue de tela em tela.
  useEffect(() => {
    if (!tocando && playlists[0]) tocar(playlists[0])
  }, [tocando, playlists, tocar])

  // "Mais louvores" vai para depois do player (que o App monta abaixo desta
  // tela), num lugar marcado em App.tsx.
  const [depoisDoTocador, setDepoisDoTocador] = useState<HTMLElement | null>(null)
  useEffect(() => setDepoisDoTocador(document.getElementById('depois-do-tocador')), [])

  const atual = tocando ?? playlists[0] ?? null

  return (
    <div className="feed feed--louvores">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Louvores</h1>
      </header>

      <p className="feed__subtitulo">
        Ouça louvores enquanto usa o aplicativo — a música continua tocando quando você vai
        para outra tela. É grátis e não precisa de conta no SoundCloud.
      </p>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}

      {!carregando && playlists.length === 0 && outros.length === 0 && (
        <div className="admin__vazio" style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 10 }}>
            Nenhuma playlist cadastrada ainda. Em breve o Evangelho terá uma biblioteca
            de louvores para você ouvir enquanto usa o app.
          </p>
          {profile?.role === 'super_admin' && (
            <Link to="/admin/louvores" className="botao botao--primario">
              Cadastrar primeira playlist
            </Link>
          )}
        </div>
      )}

      {playlists.length > 1 && (
        <div className="louvores__escolha">
          {playlists.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin__filtro${atual?.id === p.id ? ' admin__filtro--ativo' : ''}`}
              onClick={() => tocar(p)}
            >
              {p.titulo}
            </button>
          ))}
        </div>
      )}

      {atual && (
        <div>
          <p className="louvores__titulo">{atual.titulo}</p>
          {atual.descricao && <p className="feed__item-meta">{atual.descricao}</p>}
        </div>
      )}

      {/* O player aparece aqui embaixo, montado pelo App (TocadorLouvores). */}

      {outros.length > 0 && depoisDoTocador && createPortal(
        <section className="louvores__outros">
          <h2 className="admin__secao-titulo">Mais louvores</h2>
          <ul className="feed__lista">
            {outros.map((l) => (
              <li key={l.id} className="feed__item">
                {l.imagem_url && <img src={l.imagem_url} alt="" className="feed__imagem" />}
                <div className="feed__item-corpo">
                  {l.playlist && <p className="feed__categoria">{l.playlist}</p>}
                  <h3 className="feed__item-titulo">{l.titulo}</h3>
                  {l.artista && <p className="feed__item-meta">{l.artista}</p>}
                  <a href={l.url} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                    ▶ Ouvir
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>,
        depoisDoTocador,
      )}
    </div>
  )
}
