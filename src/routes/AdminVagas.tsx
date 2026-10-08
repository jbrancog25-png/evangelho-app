import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Vaga, VagaTipo } from '../lib/tipos'

const TIPOS: VagaTipo[] = ['clt', 'pj', 'estagio', 'temporaria', 'voluntariado']

export default function AdminVagas() {
  const { profile } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('vagas').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setVagas(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(v: Vaga) {
    await supabase.from('vagas').update({ publicada: !v.publicada }).eq('id', v.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('vagas').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Vagas de emprego</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormVaga autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && vagas.length === 0 && <p className="admin__vazio">Nenhuma vaga.</p>}

      <ul className="admin__lista">
        {vagas.map((v) => (
          <li key={v.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{v.titulo}</p>
                <p className="admin__item-meta">
                  {v.empresa} · {v.tipo}
                  {v.cidade ? ` · ${v.cidade}/${v.estado ?? ''}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${v.publicada ? 'aprovada' : 'pendente'}`}>
                {v.publicada ? 'publicada' : 'rascunho'}
              </span>
            </div>
            {v.descricao && <p className="palavra__texto">{v.descricao}</p>}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(v)}>
                {v.publicada ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(v.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormVaga({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState<VagaTipo>('clt')
  const [salario, setSalario] = useState('')
  const [link, setLink] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('vagas').insert({
      titulo, empresa,
      descricao: descricao || null,
      cidade: cidade || null,
      tipo,
      salario: salario || null,
      link_candidatura: link || null,
      publicada: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
      <label className="auth__campo"><span>Empresa</span><input required value={empresa} onChange={(e) => setEmpresa(e.target.value)} /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Cidade</span><input value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      <label className="auth__campo"><span>Tipo</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as VagaTipo)}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Salário (opcional)</span><input value={salario} onChange={(e) => setSalario(e.target.value)} placeholder="A combinar" /></label>
      <label className="auth__campo"><span>Link de candidatura</span><input value={link} onChange={(e) => setLink(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar vaga (rascunho)'}
      </button>
    </form>
  )
}
