import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Igreja } from '../lib/tipos'
import './Admin.css'

export default function PastorDashboard() {
  const { profile } = useAuth()
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      if (!profile) return
      setCarregando(true)
      // igrejas que o pastor criou + as que foi vinculado como gestor
      const { data: vinculos } = await supabase
        .from('pastor_igrejas')
        .select('igreja_id')
        .eq('pastor_id', profile.id)
      const idsVinculadas = (vinculos ?? []).map((v) => v.igreja_id)

      const { data, error } = await supabase
        .from('igrejas')
        .select('*')
        .or(
          `criada_por.eq.${profile.id}${idsVinculadas.length ? `,id.in.(${idsVinculadas.join(',')})` : ''}`,
        )
        .order('criada_em', { ascending: false })
      setCarregando(false)
      if (error) setErro(error.message)
      else setIgrejas(data ?? [])
    }
    carregar()
  }, [profile])

  return (
    <div className="admin">
      <header className="admin__topo">
        <Link to="/" className="admin__marca">
          <span>← Voltar</span>
        </Link>
      </header>

      <section>
        <h2 className="admin__secao-titulo">Minhas igrejas</h2>

        {carregando && <p className="admin__vazio">Carregando…</p>}
        {erro && <p className="auth__erro">{erro}</p>}
        {!carregando && igrejas.length === 0 && (
          <p className="admin__vazio">
            Você ainda não cadastrou nenhuma igreja. Clique abaixo para começar.
          </p>
        )}

        <ul className="admin__lista">
          {igrejas.map((igreja) => (
            <li key={igreja.id} className="admin__item">
              <div className="admin__item-cab">
                <div>
                  <p className="admin__item-nome">{igreja.nome}</p>
                  <p className="admin__item-meta">
                    {igreja.cidade}/{igreja.estado}
                  </p>
                </div>
                <span className={`admin__badge admin__badge--${igreja.status}`}>{igreja.status}</span>
              </div>

              {igreja.motivo_rejeicao && (
                <p className="admin__item-meta">Motivo: {igreja.motivo_rejeicao}</p>
              )}

              {igreja.status === 'aprovada' && (
                <Link to={`/pastor/igreja/${igreja.id}`} className="botao botao--primario">
                  Administrar
                </Link>
              )}
              {igreja.status === 'pendente' && (
                <p className="admin__item-meta">Aguardando aprovação da administração.</p>
              )}
            </li>
          ))}
        </ul>

        <Link to="/pastor/nova-igreja" className="botao botao--ghost" style={{ marginTop: 16, textAlign: 'center' }}>
          + Cadastrar nova igreja
        </Link>
      </section>
    </div>
  )
}
