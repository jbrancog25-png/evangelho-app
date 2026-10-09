import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Louvor } from '../lib/tipos'
import './Feed.css'

export default function FielLouvores() {
  const [louvores, setLouvores] = useState<Louvor[]>([])
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
        else setLouvores(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Louvores</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && louvores.length === 0 && <p className="admin__vazio">Nenhum louvor publicado no momento.</p>}

      <ul className="feed__lista">
        {louvores.map((l) => (
          <li key={l.id} className="feed__item">
            {l.imagem_url && <img src={l.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              {l.playlist && <p className="feed__categoria">{l.playlist}</p>}
              <h2 className="feed__item-titulo">{l.titulo}</h2>
              {l.artista && <p className="feed__item-meta">{l.artista}</p>}
              <a href={l.url} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                ▶ Ouvir
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
