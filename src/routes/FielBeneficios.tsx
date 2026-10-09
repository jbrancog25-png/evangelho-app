import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Beneficio } from '../lib/tipos'
import './Feed.css'

export default function FielBeneficios() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('beneficios')
      .select('*')
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setBeneficios(data ?? [])
      })
  }, [])

  async function copiar(texto: string, id: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(id)
      setTimeout(() => setCopiado(null), 2000)
    } catch {}
  }

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Clube de benefícios</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && beneficios.length === 0 && <p className="admin__vazio">Nenhum benefício ativo no momento.</p>}

      <ul className="feed__lista">
        {beneficios.map((b) => (
          <li key={b.id} className="feed__item">
            {b.imagem_url && <img src={b.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              <p className="feed__categoria">
                {b.parceiro_nome}
                {b.desconto_percentual != null ? ` · ${b.desconto_percentual}% off` : ''}
              </p>
              <h2 className="feed__item-titulo">{b.titulo}</h2>
              {b.categoria && <p className="feed__item-meta">{b.categoria}</p>}
              {b.descricao && <p className="feed__descricao">{b.descricao}</p>}
              {b.codigo_cupom && (
                <button
                  type="button"
                  className="botao botao--ghost botao--compacto"
                  onClick={() => copiar(b.codigo_cupom!, b.id)}
                >
                  {copiado === b.id ? 'Copiado!' : `Copiar cupom: ${b.codigo_cupom}`}
                </button>
              )}
              {b.link && (
                <a href={b.link} target="_blank" rel="noreferrer" className="botao botao--primario botao--compacto">
                  Usar benefício
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
