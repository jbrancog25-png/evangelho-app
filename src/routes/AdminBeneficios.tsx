import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Beneficio } from '../lib/tipos'

export default function AdminBeneficios() {
  const { profile } = useAuth()
  const [beneficios, setBeneficios] = useState<Beneficio[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('beneficios').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setBeneficios(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(b: Beneficio) {
    await supabase.from('beneficios').update({ publicado: !b.publicado }).eq('id', b.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('beneficios').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Clube de benefícios</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormBeneficio autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && beneficios.length === 0 && <p className="admin__vazio">Nenhum benefício.</p>}

      <ul className="admin__lista">
        {beneficios.map((b) => (
          <li key={b.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{b.titulo}</p>
                <p className="admin__item-meta">
                  <strong>{b.parceiro_nome}</strong>
                  {b.desconto_percentual != null ? ` · ${b.desconto_percentual}% off` : ''}
                  {b.categoria ? ` · ${b.categoria}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${b.publicado ? 'aprovada' : 'pendente'}`}>
                {b.publicado ? 'publicado' : 'rascunho'}
              </span>
            </div>
            {b.descricao && <p className="palavra__texto">{b.descricao}</p>}
            {b.codigo_cupom && (
              <p className="admin__item-meta">Cupom: <code>{b.codigo_cupom}</code></p>
            )}
            <div className="admin__item-acoes">
              <button type="button" className="botao botao--primario" onClick={() => alternar(b)}>
                {b.publicado ? 'Despublicar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao--ghost" onClick={() => remover(b.id)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FormBeneficio({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [parceiro, setParceiro] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cupom, setCupom] = useState('')
  const [link, setLink] = useState('')
  const [categoria, setCategoria] = useState('')
  const [desconto, setDesconto] = useState<number | ''>('')
  const [validoAte, setValidoAte] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('beneficios').insert({
      parceiro_nome: parceiro,
      titulo,
      descricao: descricao || null,
      codigo_cupom: cupom || null,
      link: link || null,
      categoria: categoria || null,
      desconto_percentual: desconto === '' ? null : desconto,
      valido_ate: validoAte ? new Date(validoAte).toISOString() : null,
      imagem_url: imagemUrl || null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Nome do parceiro</span><input required value={parceiro} onChange={(e) => setParceiro(e.target.value)} /></label>
      <label className="auth__campo"><span>Título do benefício</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="20% off em todas as pizzas" /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      <label className="auth__campo"><span>Código do cupom</span><input value={cupom} onChange={(e) => setCupom(e.target.value)} placeholder="EVANGELHO20" /></label>
      <label className="auth__campo"><span>Categoria</span><input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Alimentação, Saúde…" /></label>
      <label className="auth__campo"><span>Desconto (%)</span>
        <input type="number" min={0} max={100} value={desconto} onChange={(e) => setDesconto(e.target.value === '' ? '' : Number(e.target.value))} />
      </label>
      <label className="auth__campo"><span>Válido até</span><input type="datetime-local" value={validoAte} onChange={(e) => setValidoAte(e.target.value)} /></label>
      <label className="auth__campo"><span>Link</span><input value={link} onChange={(e) => setLink(e.target.value)} /></label>
      <label className="auth__campo"><span>Imagem (URL)</span><input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar benefício (rascunho)'}
      </button>
    </form>
  )
}
