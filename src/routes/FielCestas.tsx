import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Cesta } from '../lib/tipos'
import './Feed.css'

export default function FielCestas() {
  const [cestas, setCestas] = useState<Cesta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('cestas')
      .select('*')
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false)
        if (error) setErro(error.message)
        else setCestas(data ?? [])
      })
  }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Cestas básicas</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && cestas.length === 0 && <p className="admin__vazio">Nenhuma cesta disponível no momento.</p>}

      <ul className="feed__lista">
        {cestas.map((c) => (
          <li key={c.id} className="feed__item">
            {c.imagem_url && <img src={c.imagem_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              <p className="feed__categoria">
                {c.custo_pontos > 0 ? `${c.custo_pontos} pontos para resgatar` : 'Gratuita'}
                {' · '}{c.quantidade_disponivel > 0 ? `${c.quantidade_disponivel} disponíveis` : 'esgotada'}
              </p>
              <h2 className="feed__item-titulo">{c.titulo}</h2>
              {c.local_retirada && (
                <p className="feed__item-meta">Retirar em: {c.local_retirada}{c.cidade ? ` · ${c.cidade}` : ''}</p>
              )}
              {c.descricao && <p className="feed__descricao">{c.descricao}</p>}
              <button
                type="button"
                className="botao botao--primario botao--compacto"
                disabled={c.quantidade_disponivel === 0}
              >
                {c.quantidade_disponivel === 0 ? 'Esgotada' : 'Quero resgatar'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
