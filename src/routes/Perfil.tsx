import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './Autenticacao.css'
import './Feed.css'

type Resumo = {
  igrejasSeguidas: number
  oracoesEnviadas: number
  igrejasAdministradas: number
}

export default function Perfil() {
  const { profile, session, signOut, refreshProfile } = useAuth()
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [novaSenha, setNovaSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [resumo, setResumo] = useState<Resumo>({ igrejasSeguidas: 0, oracoesEnviadas: 0, igrejasAdministradas: 0 })

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('fiel_segue').select('igreja_id', { count: 'exact', head: true }).eq('fiel_id', profile.id),
      supabase.from('pedidos_oracao').select('id', { count: 'exact', head: true }).eq('autor_id', profile.id),
      supabase.from('pastor_igrejas').select('igreja_id', { count: 'exact', head: true }).eq('pastor_id', profile.id),
    ]).then(([seguidas, oracoes, admins]) => {
      setResumo({
        igrejasSeguidas: seguidas.count ?? 0,
        oracoesEnviadas: oracoes.count ?? 0,
        igrejasAdministradas: admins.count ?? 0,
      })
    })
  }, [profile])

  if (!profile || !session) {
    return (
      <div className="feed">
        <p className="admin__vazio">Carregando…</p>
      </div>
    )
  }

  async function salvarNome(e: FormEvent) {
    e.preventDefault()
    if (!profile || nome.trim() === profile.nome) return
    setSalvando(true); setErro(null); setSucesso(null)
    const { error } = await supabase.from('profiles').update({ nome: nome.trim() }).eq('id', profile.id)
    setSalvando(false)
    if (error) { setErro(error.message); return }
    await refreshProfile()
    setSucesso('Nome atualizado.')
  }

  async function trocarSenha(e: FormEvent) {
    e.preventDefault()
    if (novaSenha.length < 6) {
      setErro('Senha precisa ter ao menos 6 caracteres.')
      return
    }
    setSalvando(true); setErro(null); setSucesso(null)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setNovaSenha('')
    setSucesso('Senha trocada com sucesso.')
  }

  const inicial = profile.nome.charAt(0).toUpperCase()
  const criadoEm = new Date(profile.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Meu perfil</h1>
      </header>

      <div className="perfil__cab">
        <span className="perfil__avatar">{inicial}</span>
        <div>
          <p className="perfil__nome">{profile.nome}</p>
          <p className="perfil__meta">{profile.email}</p>
          <p className="perfil__meta">Membro desde {criadoEm} · papel: {profile.role}</p>
        </div>
      </div>

      <ul className="perfil__resumo">
        <li>
          <span>{resumo.igrejasSeguidas}</span>
          <small>igrejas seguidas</small>
        </li>
        <li>
          <span>{resumo.oracoesEnviadas}</span>
          <small>orações enviadas</small>
        </li>
        {profile.role === 'pastor' && (
          <li>
            <span>{resumo.igrejasAdministradas}</span>
            <small>igrejas administradas</small>
          </li>
        )}
      </ul>

      <form onSubmit={salvarNome} className="auth__form">
        <label className="auth__campo">
          <span>Nome</span>
          <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <button
          type="submit"
          className="botao botao--primario"
          disabled={salvando || nome.trim() === profile.nome}
        >
          {salvando ? 'Salvando…' : 'Salvar nome'}
        </button>
      </form>

      <form onSubmit={trocarSenha} className="auth__form">
        <label className="auth__campo">
          <span>Nova senha</span>
          <input
            type="password"
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <button type="submit" className="botao botao--ghost" disabled={salvando || novaSenha.length < 6}>
          {salvando ? 'Trocando…' : 'Trocar senha'}
        </button>
      </form>

      {erro && <p className="auth__erro">{erro}</p>}
      {sucesso && <p className="auth__sucesso">{sucesso}</p>}

      <button type="button" onClick={signOut} className="botao botao--ghost">
        Sair da conta
      </button>
    </div>
  )
}
