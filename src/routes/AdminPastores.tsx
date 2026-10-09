import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { supabaseEphemeral } from '../lib/supabaseEphemeral'
import type { Igreja, Profile } from '../lib/tipos'

type PastorExibido = Pick<Profile, 'id' | 'nome' | 'email' | 'criado_em'> & {
  igrejas_ids: string[]
}

export default function AdminPastores() {
  const [pastores, setPastores] = useState<PastorExibido[]>([])
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const [{ data: ps, error: eps }, { data: igs }, { data: vincs }] = await Promise.all([
      supabase.from('profiles').select('id, nome, email, criado_em').eq('role', 'pastor').order('nome'),
      supabase.from('igrejas').select('*').eq('status', 'aprovada').order('nome'),
      supabase.from('pastor_igrejas').select('pastor_id, igreja_id'),
    ])
    setCarregando(false)
    if (eps) { setErro(eps.message); return }
    const enriched: PastorExibido[] = (ps ?? []).map((p) => ({
      ...p,
      igrejas_ids: (vincs ?? []).filter((v) => v.pastor_id === p.id).map((v) => v.igreja_id),
    }))
    setPastores(enriched)
    setIgrejas(igs ?? [])
  }

  useEffect(() => { carregar() }, [])

  async function vincular(pastorId: string, igrejaId: string) {
    const { error } = await supabase.from('pastor_igrejas').insert({ pastor_id: pastorId, igreja_id: igrejaId })
    if (error) alert('Erro ao vincular: ' + error.message)
    carregar()
  }

  async function desvincular(pastorId: string, igrejaId: string) {
    const { error } = await supabase.from('pastor_igrejas').delete().match({ pastor_id: pastorId, igreja_id: igrejaId })
    if (error) alert('Erro ao desvincular: ' + error.message)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Pastores</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo pastor'}
        </button>
      </div>

      {mostrarForm && (
        <FormNovoPastor onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {carregando && <p className="admin__vazio">Carregando…</p>}
      {erro && <p className="auth__erro">{erro}</p>}
      {!carregando && pastores.length === 0 && <p className="admin__vazio">Nenhum pastor cadastrado ainda.</p>}

      <ul className="admin__lista">
        {pastores.map((p) => {
          const naoVinculadas = igrejas.filter((i) => !p.igrejas_ids.includes(i.id))
          return (
            <li key={p.id} className="admin__item">
              <div className="admin__item-cab">
                <div>
                  <p className="admin__item-nome">{p.nome}</p>
                  <p className="admin__item-meta">{p.email}</p>
                </div>
              </div>

              <div>
                <p className="admin__item-meta" style={{ marginBottom: 6 }}>
                  <strong>Igrejas:</strong>
                </p>
                {p.igrejas_ids.length === 0 && (
                  <p className="admin__item-meta">Nenhuma igreja vinculada.</p>
                )}
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0' }}>
                  {p.igrejas_ids.map((igId) => {
                    const ig = igrejas.find((i) => i.id === igId)
                    if (!ig) return null
                    return (
                      <li key={igId}>
                        <button
                          type="button"
                          className="admin__badge admin__badge--aprovada"
                          onClick={() => {
                            if (confirm(`Desvincular ${p.nome} de ${ig.nome}?`)) desvincular(p.id, igId)
                          }}
                          style={{ cursor: 'pointer', border: 0, font: 'inherit' }}
                          title="Clique para desvincular"
                        >
                          {ig.nome} ×
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {naoVinculadas.length > 0 && (
                  <SelectVincular
                    igrejas={naoVinculadas}
                    onVincular={(igrejaId) => vincular(p.id, igrejaId)}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SelectVincular({
  igrejas, onVincular,
}: { igrejas: Igreja[]; onVincular: (id: string) => void }) {
  const [sel, setSel] = useState('')
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <select
        value={sel}
        onChange={(e) => setSel(e.target.value)}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: '1px solid var(--borda-forte)',
          borderRadius: 10,
          background: 'var(--superficie)',
          color: 'var(--txt-forte)',
        }}
      >
        <option value="">+ vincular igreja…</option>
        {igrejas.map((i) => (
          <option key={i.id} value={i.id}>{i.nome}</option>
        ))}
      </select>
      <button
        type="button"
        className="botao botao--ghost botao--compacto"
        disabled={!sel}
        onClick={() => { onVincular(sel); setSel('') }}
      >
        Vincular
      </button>
    </div>
  )
}

function FormNovoPastor({ onSalvo }: { onSalvo: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)

    // 1) Cria usuário via cliente efêmero (não derruba sessão do super_admin)
    const { data: dados, error: errCreate } = await supabaseEphemeral.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    })
    if (errCreate) {
      setEnviando(false)
      setErro(errCreate.message)
      return
    }

    const novoId = dados.user?.id
    if (!novoId) {
      setEnviando(false)
      setErro('Usuário criado mas sem id retornado. Verifique as configurações de email do Supabase.')
      return
    }

    // 2) Promove para pastor via cliente principal (RLS do super_admin permite)
    // O trigger handle_new_user já criou o profile como fiel.
    const { error: errPromote } = await supabase
      .from('profiles')
      .update({ role: 'pastor' })
      .eq('id', novoId)

    setEnviando(false)
    if (errPromote) {
      setErro('Conta criada, mas falhou ao promover a pastor: ' + errPromote.message)
      return
    }

    alert(`Pastor criado. Avise ${nome} para conferir o email de confirmação (se habilitado) e logar com a senha definida.`)
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Nome do pastor</span>
        <input required value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Senha provisória (mínimo 6)</span>
        <input type="text" minLength={6} required value={senha} onChange={(e) => setSenha(e.target.value)}
          placeholder="O pastor pode trocar depois em /perfil" />
      </label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Criando…' : 'Criar login de pastor'}
      </button>
    </form>
  )
}
