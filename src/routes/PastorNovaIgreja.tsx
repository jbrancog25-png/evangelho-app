import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './Autenticacao.css'

/** Um UUID novo — com alternativa para celulares antigos sem `crypto.randomUUID`. */
function novoId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

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

    // O id nasce aqui, e a igreja é gravada SEM pedir ela de volta
    // (`.select()`). Pedir de volta exige que o pastor já possa LER a igreja —
    // e as regras do banco só deixam o pastor ler a igreja depois do vínculo
    // em `pastor_igrejas`, que vem logo abaixo. Com `.select()` o banco
    // recusava todo cadastro de pastor ("new row violates row-level security
    // policy for table igrejas").
    const igrejaId = novoId()
    const { error: erroInsert } = await supabase.from('igrejas').insert({
      id: igrejaId,
      nome,
      cidade,
      estado,
      endereco: endereco || null,
      criada_por: profile.id,
      status: 'pendente',
    })

    if (erroInsert) {
      setEnviando(false)
      setErro(erroInsert.message)
      return
    }

    // Já vincula o pastor que cadastrou à igreja (pendente até aprovação).
    const { error: erroVinculo } = await supabase
      .from('pastor_igrejas')
      .insert({ pastor_id: profile.id, igreja_id: igrejaId })

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
