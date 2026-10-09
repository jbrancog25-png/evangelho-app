import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './Feed.css'

type DizimoResumo = {
  id: string
  valor_centavos: number
  status: string
  criado_em: string
}

export default function FielCarteira() {
  const { profile } = useAuth()
  const [dizimos, setDizimos] = useState<DizimoResumo[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('dizimos')
      .select('id, valor_centavos, status, criado_em')
      .eq('fiel_id', profile.id)
      .order('criado_em', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setCarregando(false)
        setDizimos(data ?? [])
      })
  }, [profile])

  const total = dizimos
    .filter((d) => d.status === 'aprovado')
    .reduce((acc, d) => acc + d.valor_centavos, 0)

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Carteira</h1>
      </header>

      <section className="card card--saldo">
        <div className="saldo__info">
          <p className="saldo__rotulo">Seus pontos</p>
          <p className="saldo__valor">
            {new Intl.NumberFormat('pt-BR').format(profile?.pontos ?? 0)}
          </p>
        </div>
      </section>

      <section className="card">
        <div style={{ flex: 1 }}>
          <p className="saldo__rotulo">Total dizimado</p>
          <p className="saldo__valor">
            R$ {(total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </section>

      <h2 className="admin__secao-titulo" style={{ padding: 0 }}>Histórico de dízimos</h2>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && dizimos.length === 0 && (
        <p className="admin__vazio">
          Nenhum dízimo registrado ainda. Em breve você poderá dizimar via PIX ou cartão
          direto do app para a sua igreja.
        </p>
      )}

      <ul className="feed__lista">
        {dizimos.map((d) => (
          <li key={d.id} className="feed__item">
            <div className="feed__item-corpo">
              <p className="feed__item-titulo">
                R$ {(d.valor_centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="feed__item-meta">
                {new Date(d.criado_em).toLocaleString('pt-BR')} · {d.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
