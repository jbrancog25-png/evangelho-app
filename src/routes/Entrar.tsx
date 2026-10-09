import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MarcaIgreja from '../components/MarcaIgreja'
import './Autenticacao.css'

export default function Entrar() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEnviando(false)
    if (error) {
      setErro(traduzirErro(error.message))
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="auth">
      <Link to="/" className="auth__voltar">‹ Voltar ao início</Link>
      <div className="auth__marca">
        <MarcaIgreja tamanho="painel" />
      </div>
      <h1 className="auth__titulo">Entrar</h1>
      <p className="auth__subtitulo">Acesse sua conta para seguir igrejas, pedir oração e participar.</p>

      <form className="auth__form" onSubmit={submeter}>
        <label className="auth__campo">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="auth__campo">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p className="auth__erro">{erro}</p>}

        <button type="submit" className="botao botao--primario auth__botao" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth__rodape">
        Ainda não tem conta? <Link to="/cadastrar">Cadastre-se como fiel</Link>
      </p>
    </div>
  )
}

function traduzirErro(mensagem: string) {
  if (mensagem.toLowerCase().includes('invalid login')) return 'Email ou senha incorretos.'
  if (mensagem.toLowerCase().includes('email not confirmed')) return 'Confirme seu email antes de entrar.'
  return mensagem
}
