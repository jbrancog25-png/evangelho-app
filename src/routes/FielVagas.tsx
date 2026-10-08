import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Vaga } from '../lib/tipos'
import './Feed.css'

export default function FielVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('vagas')
      .select('*')
      .eq('publicada', true)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setVagas(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Vagas de emprego</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && vagas.length === 0 && (
        <p className="admin__vazio">Nenhuma vaga aberta no momento.</p>
      )}

      <ul className="feed__lista">
        {vagas.map((v) => (
          <li key={v.id} className="feed__item">
            <div className="feed__item-corpo">
              <p className="feed__categoria">{v.tipo}</p>
              <h2 className="feed__item-titulo">{v.titulo}</h2>
              <p className="feed__item-meta">
                {v.empresa}
                {v.cidade ? ` · ${v.cidade}/${v.estado ?? ''}` : ''}
                {v.salario ? ` · ${v.salario}` : ''}
              </p>
              {v.descricao && <p className="feed__descricao">{v.descricao}</p>}
              {v.link_candidatura && (
                <a href={v.link_candidatura} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Candidatar-se
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
