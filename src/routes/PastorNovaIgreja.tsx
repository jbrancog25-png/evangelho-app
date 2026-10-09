import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './Autenticacao.css'

export default function PastorNovaIgreja() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')
  const [endereco, setEndereco] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setEnviando(true)
    setErro(null)

    const { data: igreja, error: erroInsert } = await supabase
      .from('igrejas')
      .insert({
        nome,
        cidade,
        estado,
        endereco: endereco || null,
        criada_por: profile.id,
        status: 'pendente',
      })
      .select()
      .single()

    if (erroInsert) {
      setEnviando(false)
      setErro(erroInsert.message)
      return
    }

    // Já vincula o pastor que cadastrou à igreja (pendente até aprovação).
    const { error: erroVinculo } = await supabase
      .from('pastor_igrejas')
      .insert({ pastor_id: profile.id, igreja_id: igreja.id })

    setEnviando(false)
    if (erroVinculo) {
      setErro('Igreja criada, mas não foi possível vincular ao pastor: ' + erroVinculo.message)
      return
    }

    alert('Igreja enviada para aprovação. A administração vai analisar em breve.')
    navigate('/', { replace: true })
  }

  return (
    <div className="auth">
      <Link to="/" className="auth__voltar">‹ Voltar ao início</Link>
      <h1 className="auth__titulo">Cadastrar nova igreja</h1>
      <p className="auth__subtitulo">
        O cadastro vai para aprovação da administração antes de aparecer no app.
      </p>

      <form className="auth__form" onSubmit={submeter}>
        <label className="auth__campo">
          <span>Nome da igreja</span>
          <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="auth__campo">
          <span>Cidade</span>
          <input type="text" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
        </label>
        <label className="auth__campo">
          <span>Estado (UF)</span>
          <input
            type="text"
            maxLength={2}
            required
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
          />
        </label>
        <label className="auth__campo">
          <span>Endereço (opcional)</span>
          <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </label>

        {erro && <p className="auth__erro">{erro}</p>}

        <button type="submit" className="botao botao--primario auth__botao" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar para aprovação'}
        </button>
      </form>
    </div>
  )
}
