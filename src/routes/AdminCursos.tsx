import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Curso, CursoNivel } from '../lib/tipos'

const NIVEIS: CursoNivel[] = ['basico', 'intermediario', 'avancado', 'livre']

export default function AdminCursos() {
  const { profile } = useAuth()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('cursos').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setCursos(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(c: Curso) {
    await supabase.from('cursos').update({ publicado: !c.publicado }).eq('id', c.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('cursos').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Cursos</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormCurso autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && cursos.length === 0 && <p className="admin__vazio">Nenhum curso.</p>}

      <ul className="admin__lista">
        {cursos.map((c) => (
          <li key={c.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{c.titulo}</p>
                <p className="admin__item-meta">
                  {c.instituicao ?? '—'} · {c.nivel}
                  {c.modalidade ? ` · ${c.modalidade}` : ''}
                  {c.gratuito ? ' · gratuito' : ' · pago'}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${c.publicado ? 'aprovada' : 'pendente'}`}>
                {c.publicado ? 'publicado' : 'rascunho'}
              </span>
            </div>
            {c.descricao && <p className="palavra__texto">{c.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(c)}>
                {c.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(c.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormCurso({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState<CursoNivel>('livre')
  const [duracao, setDuracao] = useState('')
  const [modalidade, setModalidade] = useState('online')
  const [gratuito, setGratuito] = useState(true)
  const [link, setLink] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('cursos').insert({
      titulo,
      instituicao: instituicao || null,
      descricao: descricao || null,
      categoria: categoria || null,
      nivel,
      duracao: duracao || null,
      modalidade: modalidade || null,
      link: link || null,
      imagem_url: imagemUrl || null,
      gratuito,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
      <label className="auth__campo"><span>Instituição</span><input value={instituicao} onChange={(e) => setInstituicao(e.target.value)} placeholder="SENAI, Sebrae…" /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Categoria</span><input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Idiomas, Programação…" /></label>
      <label className="auth__campo"><span>Nível</span>
        <select value={nivel} onChange={(e) => setNivel(e.target.value as CursoNivel)}>
          {NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Duração</span><input value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="40h, 3 meses…" /></label>
      <label className="auth__campo"><span>Modalidade</span>
        <select value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </label>
      <label className="auth__campo" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={gratuito} onChange={(e) => setGratuito(e.target.checked)} />
        <span>Gratuito</span>
      </label>
      <label className="auth__campo"><span>Link</span><input value={link} onChange={(e) => setLink(e.target.value)} /></label>
      <label className="auth__campo"><span>Imagem (URL)</span><input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar curso (rascunho)'}
      </button>
    </form>
  )
}
