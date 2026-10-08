import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Curso } from '../lib/tipos'
import './Feed.css'

export default function FielCursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('cursos')
      .select('*')
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setCursos(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Cursos</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && cursos.length === 0 && <p className="admin__vazio">Nenhum curso disponível no momento.</p>}

      <ul className="feed__lista">
        {cursos.map((c) => (
          <li key={c.id} className="feed__item">
            {c.imagem_url && <img src={c.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              <p className="feed__categoria">{c.categoria ?? c.nivel} · {c.gratuito ? 'Gratuito' : 'Pago'}</p>
              <h2 className="feed__item-titulo">{c.titulo}</h2>
              <p className="feed__item-meta">
                {c.instituicao ?? ''}
                {c.modalidade ? ` · ${c.modalidade}` : ''}
                {c.duracao ? ` · ${c.duracao}` : ''}
              </p>
              {c.descricao && <p className="feed__descricao">{c.descricao}</p>}
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Acessar curso
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
