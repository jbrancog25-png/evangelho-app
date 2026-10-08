import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Igreja } from '../lib/tipos'
import './Feed.css'

export default function FielIgrejas() {
  const { profile } = useAuth()
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [seguindo, setSeguindo] = useState<Set<string>>(new Set())
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    if (!profile) return
    setCarregando(true)
    const [{ data: igs, error: errIg }, { data: segues, error: errSeg }] = await Promise.all([
      supabase.from('igrejas').select('*').eq('status', 'aprovada').order('nome'),
      supabase.from('fiel_segue').select('igreja_id').eq('fiel_id', profile.id),
    ])
    setCarregando(false)
    if (errIg || errSeg) {
      setErro(errIg?.message || errSeg?.message || 'Erro ao carregar')
      return
    }
    setIgrejas(igs ?? [])
    setSeguindo(new Set((segues ?? []).map((s) => s.igreja_id)))
  }

  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [profile])

  async function alternarSeguir(igreja: Igreja) {
    if (!profile) return
    const jaSegue = seguindo.has(igreja.id)
    // Atualização otimista
    const novo = new Set(seguindo)
    if (jaSegue) novo.delete(igreja.id)
    else novo.add(igreja.id)
    setSeguindo(novo)

    const op = jaSegue
      ? supabase.from('fiel_segue').delete().match({ fiel_id: profile.id, igreja_id: igreja.id })
      : supabase.from('fiel_segue').insert({ fiel_id: profile.id, igreja_id: igreja.id })

    const { error } = await op
    if (error) {
      // Reverte
      setSeguindo((atual) => {
        const r = new Set(atual)
        if (jaSegue) r.add(igreja.id)
        else r.delete(igreja.id)
        return r
      })
      alert('Erro: ' + error.message)
    }
  }

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Igrejas</h1>
      </header>

      <p className="admin__item-meta">
        Siga as igrejas que você frequenta para ver a palavra, cultos e pedidos de oração no seu feed.
      </p>

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && igrejas.length === 0 && (
        <p className="admin__vazio">Nenhuma igreja aprovada ainda.</p>
      )}

      <ul className="feed__lista">
        {igrejas.map((ig) => {
          const jaSegue = seguindo.has(ig.id)
          return (
            <li key={ig.id} className="feed__item">
              <div className="feed__item-corpo">
                <h2 className="feed__item-titulo">{ig.nome}</h2>
                <p className="feed__item-meta">
                  {ig.cidade}/{ig.estado ?? 'SP'}
                  {ig.endereco ? ` · ${ig.endereco}` : ''}
                </p>
                <button
                  type="button"
                  className={jaSegue ? 'botao botao--ghost' : 'botao botao--primario'}
                  onClick={() => alternarSeguir(ig)}
                >
                  {jaSegue ? '✓ Seguindo' : '+ Seguir'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
