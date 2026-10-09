import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './Feed.css'

type ItemRanking = { id: string; nome: string; pontos: number }

export default function FielRanking() {
  const { profile } = useAuth()
  const [itens, setItens] = useState<ItemRanking[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, pontos')
      .order('pontos', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setCarregando(false)
        setItens(data ?? [])
      })
  }, [])

  const minhaPos = profile ? itens.findIndex((i) => i.id === profile.id) + 1 : 0

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Ranking</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}

      {!carregando && itens.every((i) => i.pontos === 0) && (
        <p className="admin__vazio">
          O ranking começa quando os primeiros pontos forem distribuídos.
          Dizime, participe de campanhas e doe sangue para subir posições.
        </p>
      )}

      {profile && minhaPos > 0 && (
        <p className="admin__item-meta" style={{ textAlign: 'center' }}>
          Sua posição: <strong style={{ color: 'var(--dourado-claro)' }}>#{minhaPos}</strong>
        </p>
      )}

      <ul className="feed__lista">
        {itens.map((item, i) => {
          const ehVoce = item.id === profile?.id
          return (
            <li
              key={item.id}
              className="feed__item"
              style={ehVoce ? { borderColor: 'var(--dourado-claro)' } : {}}
            >
              <div className="feed__item-corpo" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <span style={{
                  fontSize: 24, fontWeight: 800,
                  color: i < 3 ? 'var(--dourado-claro)' : 'var(--txt-medio)',
                  minWidth: 36, textAlign: 'center',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <p className="feed__item-titulo">
                    {item.nome}{ehVoce ? ' (você)' : ''}
                  </p>
                  <p className="feed__item-meta">
                    {item.pontos.toLocaleString('pt-BR')} pontos
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
