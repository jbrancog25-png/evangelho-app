import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Desapego } from '../lib/tipos'

type Filtro = 'pendente' | 'publicado' | 'todos'

export default function AdminDesapegos() {
  const [itens, setItens] = useState<Desapego[]>([])
  const [filtro, setFiltro] = useState<Filtro>('pendente')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    let q = supabase.from('desapegos').select('*').order('criado_em', { ascending: false })
    if (filtro === 'pendente') q = q.eq('publicado', false)
    if (filtro === 'publicado') q = q.eq('publicado', true)
    const { data, error } = await q
    setCarregando(false)
    if (error) setErro(error.message)
    else setItens(data ?? [])
  }

  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [filtro])

  async function alternar(d: Desapego) {
    await supabase.from('desapegos').update({ publicado: !d.publicado }).eq('id', d.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('desapegos').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <h2 className="admin__secao-titulo">Desapego — moderação</h2>

      <div className="admin__filtros">
        {(['pendente', 'publicado', 'todos'] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`admin__filtro${filtro === f ? ' admin__filtro--ativo' : ''}`}
          >
            {f === 'pendente' ? 'Pendentes' : f === 'publicado' ? 'Publicados' : 'Todos'}
          </button>
        ))}
      </div>

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && itens.length === 0 && <p className="admin__vazio">Nada neste filtro.</p>}

      <ul className="admin__lista">
        {itens.map((d) => (
          <li key={d.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{d.titulo}</p>
                <p className="admin__item-meta">
                  {d.categoria ?? '—'}
                  {d.cidade ? ` · ${d.cidade}` : ''}
                  {' · '}contato: {d.contato}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${d.publicado ? 'aprovada' : 'pendente'}`}>
                {d.publicado ? 'publicado' : 'pendente'}
              </span>
            </div>
            {d.descricao && <p className="palavra__texto">{d.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(d)}>
                {d.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(d.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
