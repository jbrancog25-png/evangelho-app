import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { DIAS_SEMANA, type Culto, type Igreja } from '../lib/tipos'
import './Feed.css'

type Agrupado = { igreja: Igreja; cultos: Culto[] }

export default function FielCultos() {
  const { profile } = useAuth()
  const [agrupados, setAgrupados] = useState<Agrupado[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      if (!profile) return
      setCarregando(true)
      const { data: segues, error: errSeg } = await supabase
        .from('fiel_segue')
        .select('igreja_id')
        .eq('fiel_id', profile.id)
      if (errSeg) { setErro(errSeg.message); setCarregando(false); return }
      const ids = (segues ?? []).map((s) => s.igreja_id)
      if (ids.length === 0) {
        setAgrupados([])
        setCarregando(false)
        return
      }
      const [{ data: igs }, { data: cultos }] = await Promise.all([
        supabase.from('igrejas').select('*').in('id', ids),
        supabase.from('cultos').select('*').in('igreja_id', ids).eq('ativo', true).order('dia_semana').order('hora'),
      ])
      const grupos: Agrupado[] = (igs ?? []).map((igreja) => ({
        igreja,
        cultos: (cultos ?? []).filter((c) => c.igreja_id === igreja.id),
      }))
      setAgrupados(grupos)
      setCarregando(false)
    }
    carregar()
  }, [profile])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Cultos</h1>
      </header>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}

      {!carregando && agrupados.length === 0 && (
        <div className="admin__vazio">
          <p>Você ainda não segue nenhuma igreja.</p>
          <Link to="/igrejas" className="botao botao--primario" style={{ marginTop: 12, display: 'inline-block' }}>
            Descobrir igrejas
          </Link>
        </div>
      )}

      {agrupados.map(({ igreja, cultos }) => (
        <section key={igreja.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="admin__secao-titulo" style={{ padding: 0 }}>
            {igreja.nome}
            <span className="admin__item-meta" style={{ marginLeft: 8, fontWeight: 500 }}>
              {igreja.cidade}/{igreja.estado ?? 'SP'}
            </span>
          </h2>

          {cultos.length === 0 ? (
            <p className="admin__vazio">Nenhum culto cadastrado por essa igreja ainda.</p>
          ) : (
            <ul className="feed__lista">
              {cultos.map((c) => (
                <li key={c.id} className="feed__item">
                  <div className="feed__item-corpo">
                    <p className="feed__categoria">{c.recorrencia}</p>
                    <h3 className="feed__item-titulo">
                      {DIAS_SEMANA[c.dia_semana]} · {c.hora.slice(0, 5)}
                    </h3>
                    {c.local && <p className="feed__item-meta">{c.local}</p>}
                    {c.observacao && <p className="feed__descricao">{c.observacao}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
