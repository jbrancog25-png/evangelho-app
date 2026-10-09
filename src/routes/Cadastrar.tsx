import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MarcaIgreja from '../components/MarcaIgreja'
import './Autenticacao.css'

export default function Cadastrar() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)
    setEnviando(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role: 'fiel' },
      },
    })
    setEnviando(false)
    if (error) {
      setErro(error.message)
      return
    }
    if (data.session) {
      navigate('/', { replace: true })
      return
    }
    setSucesso('Enviamos um email de confirmação. Verifique sua caixa de entrada e volte para entrar.')
  }

  return (
    <div className="auth">
      <Link to="/" className="auth__voltar">‹ Voltar ao início</Link>
      <div className="auth__marca">
        <MarcaIgreja tamanho="painel" />
      </div>
      <h1 className="auth__titulo">Cadastro</h1>
      <p className="auth__subtitulo">Crie sua conta de fiel. Pastores recebem acesso pela administração.</p>

      <form className="auth__form" onSubmit={submeter}>
        <label className="auth__campo">
          <span>Nome</span>
          <input
            type="text"
            autoComplete="name"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </label>
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
          <span>Senha (mínimo 6)</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p className="auth__erro">{erro}</p>}
        {sucesso && <p className="auth__sucesso">{sucesso}</p>}

        <button type="submit" className="botao botao--primario auth__botao" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Criar conta'}
        </button>
      </form>

      <p className="auth__rodape">
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </div>
  )
}
