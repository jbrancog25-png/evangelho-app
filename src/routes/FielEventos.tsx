import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Evento } from '../lib/tipos'
import './Feed.css'

export default function FielEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('eventos')
      .select('*')
      .eq('publicado', true)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setEventos(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Eventos</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && eventos.length === 0 && (
        <p className="admin__vazio">Nenhum evento programado no momento.</p>
      )}

      <ul className="feed__lista">
        {eventos.map((ev) => (
          <li key={ev.id} className="feed__item">
            {ev.imagem_url && <img src={ev.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              <p className="feed__categoria">{ev.categoria}</p>
              <h2 className="feed__item-titulo">{ev.titulo}</h2>
              <p className="feed__item-meta">
                {formatarDataLonga(ev.data_inicio)}
                {ev.local ? ` · ${ev.local}` : ''}
                {ev.cidade ? ` · ${ev.cidade}/${ev.estado ?? ''}` : ''}
              </p>
              {ev.descricao && <p className="feed__descricao">{ev.descricao}</p>}
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Saiba mais
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatarDataLonga(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
