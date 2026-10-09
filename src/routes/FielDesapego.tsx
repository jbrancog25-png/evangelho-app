import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Desapego } from '../lib/tipos'
import './Feed.css'

export default function FielDesapego() {
  const { profile } = useAuth()
  const [itens, setItens] = useState<Desapego[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('desapegos')
      .select('*')
      .eq('publicado', true)
      .eq('disponivel', true)
      .order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setItens(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Desapego</h1>
      </header>

      {profile && (
        <button
          type="button"
          className="botao botao--primario"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : '+ Doar algo'}
        </button>
      )}

      {mostrarForm && profile && (
        <FormDesapego autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && itens.length === 0 && (
        <p className="admin__vazio">Nenhum item disponível no momento. Que tal doar algo?</p>
      )}

      <ul className="feed__lista">
        {itens.map((d) => (
          <li key={d.id} className="feed__item">
            {d.foto_url && <img src={d.foto_url} alt="" className="feed__imagem" />}
            <div className="feed__item-corpo">
              {d.categoria && <p className="feed__categoria">{d.categoria}</p>}
              <h2 className="feed__item-titulo">{d.titulo}</h2>
              {d.cidade && <p className="feed__item-meta">{d.cidade}</p>}
              {d.descricao && <p className="feed__descricao">{d.descricao}</p>}
              <a
                href={`https://wa.me/55${d.contato.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="botao botao--primario botao--compacto"
              >
                Falar com quem doa
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FormDesapego({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('roupa')
  const [cidade, setCidade] = useState('')
  const [contato, setContato] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('desapegos').insert({
      titulo,
      descricao: descricao || null,
      categoria,
      cidade: cidade || null,
      contato,
      foto_url: fotoUrl || null,
      autor_id: autorId,
      publicado: false,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    alert('Item enviado para moderação. Em breve aparecerá na lista.')
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Sofá 3 lugares em bom estado" /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Categoria</span>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="roupa">Roupa</option>
          <option value="movel">Móvel</option>
          <option value="eletronico">Eletrônico</option>
          <option value="alimento">Alimento</option>
          <option value="livro">Livro</option>
          <option value="brinquedo">Brinquedo</option>
          <option value="outro">Outro</option>
        </select>
      </label>
      <label className="auth__campo"><span>Cidade</span><input value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      <label className="auth__campo"><span>WhatsApp para contato (DDD + número)</span>
        <input required value={contato} onChange={(e) => setContato(e.target.value)} placeholder="11 98765-4321" />
      </label>
      <label className="auth__campo"><span>Foto (URL, opcional)</span><input value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar para moderação'}
      </button>
    </form>
  )
}
