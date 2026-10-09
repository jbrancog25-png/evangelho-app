import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTocador } from '../hooks/useTocador'
import { playerSoundCloud, playlistDoSoundCloud } from '../lib/soundcloud'
import './TocadorLouvores.css'

/**
 * O player do SoundCloud, que sobrevive à troca de tela (vem do Evangelho antigo).
 *
 * Mora no App, fora das rotas: se morasse na tela de Louvores, sair dela
 * desligaria a música. Em /louvores ele aparece logo abaixo da tela; nas
 * outras, fica montado mas fora da vista, e a música segue. Esconder com
 * `display: none` não serve: alguns navegadores param a mídia de um quadro
 * invisível. Por isso ele encolhe para 1 pixel, transparente e sem toque.
 *
 * Nas outras telas, um botão "♪ Louvores" leva de volta ao player.
 */
export default function TocadorLouvores() {
  const { session } = useAuth()
  const { tocando } = useTocador()
  const { pathname } = useLocation()

  if (!session || !tocando) return null
  const visivel = pathname === '/louvores'
  const endereco = playlistDoSoundCloud(tocando.url)

  if (!endereco) {
    return visivel ? (
      <div className="tocador">
        <p className="auth__erro">
          Esta playlist não abriu: o endereço cadastrado no painel não é de uma playlist do
          SoundCloud. Cole o link da playlist ou o código de "Incorporar" do SoundCloud.
        </p>
      </div>
    ) : null
  }

  return (
    <>
      <div className={visivel ? 'tocador' : 'tocador tocador--escondido'} aria-hidden={!visivel}>
        <iframe
          // A chave troca o quadro quando a playlist muda — sem ela o player
          // continuaria na playlist anterior.
          key={tocando.id}
          className="tocador__quadro"
          title={`Louvores — ${tocando.titulo}`}
          src={playerSoundCloud(endereco)}
          width="100%"
          height={visivel ? 460 : 1}
          allow="autoplay; encrypted-media"
          loading="lazy"
        />
        {visivel && (
          <>
            {tocando.pagina && (
              <p className="tocador__credito">
                <a href={tocando.pagina} target="_blank" rel="noopener noreferrer">
                  {tocando.autor ? `${tocando.autor} · ` : ''}Ouvir no SoundCloud ›
                </a>
              </p>
            )}
            <p className="tocador__aviso">
              Músicas tocadas pelo player oficial do SoundCloud. O Evangelho não guarda nem
              transmite áudio.
            </p>
          </>
        )}
      </div>

      {!visivel && (
        <div className="tocador__atalho">
          <Link to="/louvores" className="tocador__atalho-botao">
            ♪ Louvores
          </Link>
        </div>
      )}
    </>
  )
}
