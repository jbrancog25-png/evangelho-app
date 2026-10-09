import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Evento, EventoCategoria } from '../lib/tipos'
import './Feed.css'

const TITULOS: Record<string, string> = {
  esportivo: 'Esportes',
  show: 'Shows',
  cultural: 'Cultura',
  educativo: 'Educação',
  saude: 'Saúde',
  missao: 'Missões',
  solidario: 'Ações solidárias',
  curso: 'Cursos',
  outros: 'Outros eventos',
}

export default function FielAtividade() {
  const { categoria } = useParams<{ categoria: string }>()
  const titulo = (categoria && TITULOS[categoria]) || 'Atividades'

  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!categoria) return
    supabase
      .from('eventos')
      .select('*')
      .eq('publicado', true)
      .eq('categoria', categoria as EventoCategoria)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setEventos(data ?? [])
      })
  }, [categoria])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">{titulo}</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && eventos.length === 0 && (
        <p className="admin__vazio">Nenhum item nessa categoria no momento.</p>
      )}

      <ul className="feed__lista">
        {eventos.map((ev) => (
          <li key={ev.id} className="feed__item">
            {ev.imagem_url && <img src={ev.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              <h2 className="feed__item-titulo">{ev.titulo}</h2>
              <p className="feed__item-meta">
                {formatarData(ev.data_inicio)}
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

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
