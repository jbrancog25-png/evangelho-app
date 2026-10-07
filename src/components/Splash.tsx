import { useEffect, useState } from 'react'
import logo from '../assets/vida-em-cristo.jpg'
import './Splash.css'

type Props = {
  /** Em milissegundos. */
  duracao?: number
  onConcluir?: () => void
}

export default function Splash({ duracao = 2400, onConcluir }: Props) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const fade = window.setTimeout(() => setSaindo(true), duracao - 400)
    const fim = window.setTimeout(() => onConcluir?.(), duracao)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(fim)
    }
  }, [duracao, onConcluir])

  return (
    <div
      className={`splash${saindo ? ' splash--saindo' : ''}`}
      onClick={() => onConcluir?.()}
      role="presentation"
    >
      <span className="splash__halo" aria-hidden="true" />
      <div className="splash__particulas" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="splash__palco">
        <img className="splash__logo" src={logo} alt="Igreja Mundial Vida em Cristo" />
        <span className="splash__brilho" aria-hidden="true" />
      </div>
    </div>
  )
}
