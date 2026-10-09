import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { CampanhaSangue, UrgenciaSangue } from '../lib/tipos'
import './Feed.css'

const CORES_URGENCIA: Record<UrgenciaSangue, string> = {
  baixa: 'aprovada',
  media: 'pendente',
  alta: 'rejeitada',
  critica: 'rejeitada',
}

export default function FielSangue() {
  const [campanhas, setCampanhas] = useState<CampanhaSangue[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('campanhas_sangue')
      .select('*')
      .eq('publicado', true)
      .order('urgencia', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setCampanhas(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Doação de sangue</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && campanhas.length === 0 && (
        <p className="admin__vazio">Nenhuma campanha ativa no momento.</p>
      )}

      <ul className="feed__lista">
        {campanhas.map((c) => (
          <li key={c.id} className="feed__item">
            <div className="feed__item-corpo">
              <p className="feed__categoria">
                <span className={`admin__badge admin__badge--${CORES_URGENCIA[c.urgencia]}`}>
                  Urgência {c.urgencia}
                </span>
              </p>
              <h2 className="feed__item-titulo">{c.hospital}</h2>
              <p className="feed__item-meta">
                {c.cidade}/{c.estado ?? ''}
                {c.tipos_sanguineos ? ` · tipos: ${c.tipos_sanguineos}` : ''}
              </p>
              {c.descricao && <p className="feed__descricao">{c.descricao}</p>}
              {c.link_agendamento && (
                <a href={c.link_agendamento} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Agendar doação
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
