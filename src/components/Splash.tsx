import { useEffect, useState } from 'react'
import './Splash.css'

/**
 * A abertura do Evangelho: o logo da igreja em 3D, antes do Início.
 *
 * Copiada da abertura do Evangelho antigo (conex-app/src/evangelho/Abertura.tsx).
 * O globo entra girando — é uma peça de ouro com espessura, não uma figura
 * chapada —, o nome sobe logo depois, um brilho passa por cima dos dois e a
 * cena se desfaz sobre o Início, que já foi montado por baixo.
 *
 * A espessura é o truque principal: atrás do globo ficam várias cópias
 * escurecidas dele, cada uma um pouco mais funda. De frente não se vê nada;
 * girando, elas formam a borda da peça.
 *
 * Regras:
 *   - um toque pula;
 *   - quem pediu ao celular para reduzir movimento vê o logo aparecer e sumir,
 *     sem giro;
 *   - aparece uma vez por visita (ver `deveAbrir`);
 *   - se as imagens não chegam a tempo, não há abertura — melhor abrir o app
 *     do que segurar a pessoa numa tela preta.
 */

const GLOBO = '/assets/abertura-globo.webp'
const LADO = '/assets/abertura-globo-lado.webp'
const TEXTO = '/assets/abertura-texto.webp'
const CONEX = '/assets/icon-192.png'

/** Quantas cópias fazem a espessura, e a distância entre elas (px). */
const CAMADAS = 9
const PASSO = 1.5

/** Durações em ms. As de 3,6 s e 1,9 s também estão no Splash.css. */
const DURACAO = 3600
const DURACAO_CALMA = 1900
const SAIDA_AO_TOCAR = 320

/** Quanto se espera pelas imagens antes de desistir da abertura. */
const ESPERA_MAXIMA = 2500

const CHAVE = 'evangelho:abertura-vista'

/** A abertura deve aparecer nesta visita? Recarregar a página não repete. */
export function deveAbrir(): boolean {
  try {
    return !sessionStorage.getItem(CHAVE)
  } catch {
    // Sem sessionStorage (janela anônima em alguns aparelhos): abre sempre.
    return true
  }
}

function marcarVista() {
  try {
    sessionStorage.setItem(CHAVE, '1')
  } catch {
    // Sem onde guardar: a abertura volta na próxima carga, e tudo bem.
  }
}

function carregar(src: string): Promise<void> {
  const img = new Image()
  img.src = src
  return img.decode()
}

type Props = {
  onConcluir: () => void
}

export default function Splash({ onConcluir }: Props) {
  const [calma] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const [fase, setFase] = useState<'carregando' | 'rodando' | 'saindo'>('carregando')

  // Espera as imagens estarem prontas: começar a girar com o globo pela
  // metade estraga o efeito.
  useEffect(() => {
    let vivo = true
    const desistir = window.setTimeout(() => vivo && onConcluir(), ESPERA_MAXIMA)
    Promise.all([
      carregar(GLOBO),
      carregar(TEXTO),
      carregar(CONEX),
      calma ? Promise.resolve() : carregar(LADO),
    ])
      .then(() => {
        if (!vivo) return
        window.clearTimeout(desistir)
        marcarVista()
        setFase('rodando')
      })
      .catch(() => vivo && onConcluir())
    return () => {
      vivo = false
      window.clearTimeout(desistir)
    }
  }, [calma, onConcluir])

  useEffect(() => {
    if (fase === 'carregando') return
    const espera = fase === 'saindo' ? SAIDA_AO_TOCAR : calma ? DURACAO_CALMA : DURACAO
    const t = window.setTimeout(onConcluir, espera)
    return () => window.clearTimeout(t)
  }, [fase, calma, onConcluir])

  const pular = () => {
    if (fase === 'rodando') setFase('saindo')
  }

  const classe = [
    'abx',
    calma ? 'abx-calma' : '',
    fase === 'rodando' ? 'abx-on' : '',
    fase === 'saindo' ? 'abx-sai' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classe} role="img" aria-label="Igreja Mundial Vida em Cristo" onClick={pular}>
      {fase !== 'carregando' && (
        <>
          <div className="abx-cena">
            <div className="abx-halo" />
            <div className="abx-globo">
              {!calma &&
                Array.from({ length: CAMADAS }, (_, i) => (
                  <img
                    key={i}
                    src={LADO}
                    alt=""
                    className="abx-camada abx-lado"
                    style={{ transform: `translateZ(${-(i + 1) * PASSO}px)` }}
                  />
                ))}
              <img src={GLOBO} alt="" className="abx-camada abx-frente" />
              <div
                className="abx-brilho"
                style={{ WebkitMaskImage: `url(${GLOBO})`, maskImage: `url(${GLOBO})` }}
              />
            </div>
            <div className="abx-texto">
              <img src={TEXTO} alt="" />
              <div
                className="abx-brilho abx-brilho-texto"
                style={{ WebkitMaskImage: `url(${TEXTO})`, maskImage: `url(${TEXTO})` }}
              />
            </div>
          </div>
          <div className="abx-credito">
            <img src={CONEX} alt="" width={22} height={22} />
            <span>
              Um projeto <b>CONEX</b>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
