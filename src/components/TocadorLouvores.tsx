import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTocador } from '../hooks/useTocador'
import { playerSoundCloud, playlistDoSoundCloud } from '../lib/soundcloud'
import './TocadorLouvores.css'

type SCSound = { title: string; user?: { username?: string }; artwork_url?: string | null }
type SCWidget = {
  play(): void
  pause(): void
  next(): void
  prev(): void
  bind(event: string, cb: (...args: unknown[]) => void): void
  getCurrentSound(cb: (s: SCSound | null) => void): void
}

declare global {
  interface Window {
    SC?: {
      Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
        Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string }
      }
    }
  }
}

/**
 * O player do SoundCloud, que sobrevive à troca de tela.
 *
 * Em qualquer rota (menos /louvores) aparece como barra flutuante com
 * controles reais (play/pause/anterior/próximo) via SoundCloud Widget API.
 * Em /louvores vira o player cheio.
 */
export default function TocadorLouvores() {
  const { session } = useAuth()
  const { tocando } = useTocador()
  const { pathname } = useLocation()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const [pronto, setPronto] = useState(false)
  const [tocandoAgora, setTocandoAgora] = useState(false)
  const [faixa, setFaixa] = useState<SCSound | null>(null)

  const noPlayer = pathname === '/louvores'
  const endereco = tocando ? playlistDoSoundCloud(tocando.url) : null

  // Reset estado quando trocar de playlist
  useEffect(() => {
    setPronto(false)
    setTocandoAgora(false)
    setFaixa(null)
    widgetRef.current = null
  }, [tocando?.id])

  // Conecta ao widget quando o iframe estiver no DOM e o script do SC carregado
  useEffect(() => {
    if (!iframeRef.current || !endereco) return
    let cancelado = false

    function tentarConectar(tentativa = 0) {
      if (cancelado) return
      const iframe = iframeRef.current
      if (!iframe || !window.SC?.Widget) {
        if (tentativa < 40) {
          window.setTimeout(() => tentarConectar(tentativa + 1), 100)
        }
        return
      }
      const w = window.SC.Widget(iframe)
      widgetRef.current = w
      const ev = window.SC.Widget.Events
      w.bind(ev.READY, () => {
        if (cancelado) return
        setPronto(true)
        w.getCurrentSound((s) => s && setFaixa(s))
      })
      w.bind(ev.PLAY, () => {
        if (cancelado) return
        setTocandoAgora(true)
        w.getCurrentSound((s) => s && setFaixa(s))
      })
      w.bind(ev.PAUSE, () => !cancelado && setTocandoAgora(false))
      w.bind(ev.FINISH, () => !cancelado && setTocandoAgora(false))
    }

    tentarConectar()
    return () => { cancelado = true }
  }, [tocando?.id, endereco])

  if (!session || !tocando) return null

  if (!endereco) {
    return noPlayer ? (
      <div className="tocador">
        <p className="auth__erro">
          Esta playlist não abriu: o endereço cadastrado no painel não é de uma playlist do
          SoundCloud. Cole o link da playlist ou o código de "Incorporar" do SoundCloud.
        </p>
      </div>
    ) : null
  }

  const play = () => widgetRef.current?.play()
  const pause = () => widgetRef.current?.pause()
  const proximo = () => widgetRef.current?.next()
  const anterior = () => widgetRef.current?.prev()

  const tituloFaixa = faixa?.title ?? tocando.titulo
  const autorFaixa = faixa?.user?.username ?? tocando.autor ?? 'Louvores'

  return (
    <>
      <div className={noPlayer ? 'tocador' : 'tocador tocador--escondido'} aria-hidden={!noPlayer}>
        <iframe
          ref={iframeRef}
          key={tocando.id}
          className="tocador__quadro"
          title={`Louvores — ${tocando.titulo}`}
          src={playerSoundCloud(endereco)}
          width="100%"
          height={noPlayer ? 460 : 1}
          allow="autoplay; encrypted-media"
          loading="lazy"
        />
        {noPlayer && (
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

      {!noPlayer && (
        <div className="tocador-barra" role="region" aria-label="Tocando louvores">
          <Link to="/louvores" className="tocador-barra__info" aria-label="Abrir louvores">
            <span className="tocador-barra__onda" aria-hidden="true">♪</span>
            <span className="tocador-barra__textos">
              <span className="tocador-barra__titulo">{tituloFaixa}</span>
              <span className="tocador-barra__artista">{autorFaixa}</span>
            </span>
          </Link>
          <div className="tocador-barra__controles">
            <button
              type="button"
              onClick={anterior}
              disabled={!pronto}
              aria-label="Anterior"
              className="tocador-barra__botao"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={() => (tocandoAgora ? pause() : play())}
              disabled={!pronto}
              className="tocador-barra__botao tocador-barra__play"
              aria-label={tocandoAgora ? 'Pausar' : 'Tocar'}
            >
              {tocandoAgora ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              onClick={proximo}
              disabled={!pronto}
              aria-label="Próxima"
              className="tocador-barra__botao"
            >
              ⏭
            </button>
          </div>
        </div>
      )}
    </>
  )
}
