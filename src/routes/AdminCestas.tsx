import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Cesta } from '../lib/tipos'

export default function AdminCestas() {
  const { profile } = useAuth()
  const [cestas, setCestas] = useState<Cesta[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.from('cestas').select('*').order('criado_em', { ascending: false })
    setCarregando(false)
    if (error) setErro(error.message)
    else setCestas(data ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function alternar(c: Cesta) {
    await supabase.from('cestas').update({ publicado: !c.publicado }).eq('id', c.id)
    carregar()
  }
  async function remover(id: string) {
    if (!confirm('Remover?')) return
    await supabase.from('cestas').delete().eq('id', id)
    carregar()
  }
  async function ajustarEstoque(c: Cesta, delta: number) {
    const nova = Math.max(0, c.quantidade_disponivel + delta)
    await supabase.from('cestas').update({ quantidade_disponivel: nova }).eq('id', c.id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Cestas básicas</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormCesta autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && cestas.length === 0 && <p className="admin__vazio">Nenhuma cesta.</p>}

      <ul className="admin__lista">
        {cestas.map((c) => (
          <li key={c.id} className="admin__item">
            <div className="admin__item-cab">
              <div>
                <p className="admin__item-nome">{c.titulo}</p>
                <p className="admin__item-meta">
                  {c.custo_pontos > 0 ? `${c.custo_pontos} pontos` : 'gratuita'}
                  {c.local_retirada ? ` · ${c.local_retirada}` : ''}
                  {c.cidade ? ` · ${c.cidade}` : ''}
                </p>
              </div>
              <span className={`admin__badge admin__badge--${c.publicado ? 'aprovada' : 'pendente'}`}>
                {c.publicado ? 'publicada' : 'rascunho'}
              </span>
            </div>
            {c.descricao && <p className="palavra__texto">{c.descricao}</p>}
            <div className="admin__item-cab" style={{ alignItems: 'center' }}>
              <span className="admin__item-meta"><strong>Estoque:</strong> {c.quantidade_disponivel}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="botao botao--ghost botao--compacto" onClick={() => ajustarEstoque(c, -1)}>−</button>
                <button type="button" className="botao botao--ghost botao--compacto" onClick={() => ajustarEstoque(c, +1)}>+</button>
                <button type="button" className="botao botao--ghost botao--compacto" onClick={() => ajustarEstoque(c, +10)}>+10</button>
              </div>
            </div>
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

function FormCesta({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [quantidade, setQuantidade] = useState(0)
  const [custoPontos, setCustoPontos] = useState(0)
  const [local, setLocal] = useState('')
  const [cidade, setCidade] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('cestas').insert({
      titulo,
      descricao: descricao || null,
      imagem_url: imagemUrl || null,
      quantidade_disponivel: quantidade,
      custo_pontos: custoPontos,
      local_retirada: local || null,
      cidade: cidade || null,
      publicado: false,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Título</span><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Cesta Básica Padrão" /></label>
      <label className="auth__campo"><span>Descrição</span><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que vem na cesta…" /></label>
      <label className="auth__campo"><span>Imagem (URL)</span><input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} /></label>
      <label className="auth__campo"><span>Quantidade disponível</span>
        <input type="number" min={0} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
      </label>
      <label className="auth__campo"><span>Custo em pontos (0 = gratuita)</span>
        <input type="number" min={0} value={custoPontos} onChange={(e) => setCustoPontos(Number(e.target.value))} />
      </label>
      <label className="auth__campo"><span>Local de retirada</span><input value={local} onChange={(e) => setLocal(e.target.value)} /></label>
      <label className="auth__campo"><span>Cidade</span><input value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Criar cesta (rascunho)'}
      </button>
    </form>
  )
}
