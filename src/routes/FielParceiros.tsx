import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Parceiro } from '../lib/tipos'
import './Feed.css'

export default function FielParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('parceiros')
      .select('*')
      .eq('publicado', true)
      .order('nome')
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setParceiros(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Entidades parceiras</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && parceiros.length === 0 && <p className="admin__vazio">Nenhum parceiro no momento.</p>}

      <ul className="feed__lista">
        {parceiros.map((p) => (
          <li key={p.id} className="feed__item">
            <div className="feed__item-corpo">
              <p className="feed__categoria">{p.tipo}</p>
              <h2 className="feed__item-titulo">{p.nome}</h2>
              {p.cidade && (
                <p className="feed__item-meta">{p.cidade}/{p.estado ?? ''}</p>
              )}
              {p.descricao && <p className="feed__descricao">{p.descricao}</p>}
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Conhecer
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
