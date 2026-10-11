import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { HorarioConsulta } from '../lib/tipos'

const ESPECIALIDADES = [
  'clinico', 'pediatria', 'psicologia', 'psiquiatria', 'nutricao',
  'ginecologia', 'odontologia', 'outra',
]

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type HorarioAdmin = HorarioConsulta & { publicado?: boolean; criado_em?: string }

export default function AdminConsultas() {
  const { profile } = useAuth()
  const [horarios, setHorarios] = useState<HorarioAdmin[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    // Super_admin pode ler todos (publicados ou não) direto da tabela;
    // precisamos juntar as vagas restantes vindas da view.
    const [{ data: rows, error: eRows }, { data: abertas }] = await Promise.all([
      supabase.from('consultas_horarios').select('*').order('data').order('hora'),
      supabase.from('consultas_abertas').select('id, restantes'),
    ])
    setCarregando(false)
    if (eRows) { setErro(eRows.message); return }
    const mapaRestantes = new Map<string, number>()
    ;(abertas ?? []).forEach((a: { id: string; restantes: number }) => mapaRestantes.set(a.id, a.restantes))
    setHorarios((rows ?? []).map((r) => ({ ...r, restantes: mapaRestantes.get(r.id) ?? r.vagas })))
  }

  useEffect(() => { carregar() }, [])

  async function alternar(h: HorarioAdmin) {
    await supabase.from('consultas_horarios').update({ publicado: !h.publicado }).eq('id', h.id)
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover este horário? Quem já marcou perde a consulta.')) return
    await supabase.from('consultas_horarios').delete().eq('id', id)
    carregar()
  }

  return (
    <section>
      <div className="admin__item-cab">
        <h2 className="admin__secao-titulo">Horários de consulta</h2>
        <button type="button" className="botao botao--primario botao--compacto" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Novo horário'}
        </button>
      </div>

      {mostrarForm && profile && (
        <FormHorario autorId={profile.id} onSalvo={() => { setMostrarForm(false); carregar() }} />
      )}

      {erro && <p className="auth__erro">{erro}</p>}
      {carregando && <p className="admin__vazio">Carregando…</p>}
      {!carregando && horarios.length === 0 && <p className="admin__vazio">Nenhum horário cadastrado.</p>}

      <ul className="admin__lista">
        {horarios.map((h) => {
          const d = new Date(h.data + 'T12:00:00Z')
          return (
            <li key={h.id} className="admin__item">
              <div className="admin__item-cab">
                <div>
                  <p className="admin__item-nome">
                    {DIAS_SEMANA[d.getUTCDay()]} · {h.data.split('-').reverse().slice(0, 2).join('/')} · {h.hora.slice(0, 5)}
                  </p>
                  <p className="admin__item-meta">
                    {h.especialidade}{h.profissional ? ` · ${h.profissional}` : ''}
                    {' · '}{h.modalidade}{h.local ? ` · ${h.local}` : ''}
                    {' · '}{h.restantes}/{h.vagas} vagas
                  </p>
                </div>
                <span className={`admin__badge admin__badge--${h.publicado ? 'aprovada' : 'pendente'}`}>
                  {h.publicado ? 'publicado' : 'rascunho'}
                </span>
              </div>
              {h.observacao && <p className="palavra__texto">{h.observacao}</p>}
              <div className="admin__item-acoes">
                <button type="button" className="botao botao--primario" onClick={() => alternar(h)}>
                  {h.publicado ? 'Despublicar' : 'Publicar'}
                </button>
                <button type="button" className="botao botao--ghost" onClick={() => remover(h.id)}>
                  Remover
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function FormHorario({ autorId, onSalvo }: { autorId: string; onSalvo: () => void }) {
  const [data, setData] = useState('')
  const [hora, setHora] = useState('18:30')
  const [especialidade, setEspecialidade] = useState('clinico')
  const [profissional, setProfissional] = useState('')
  const [modalidade, setModalidade] = useState<'online' | 'presencial'>('online')
  const [local, setLocal] = useState('')
  const [duracao, setDuracao] = useState(30)
  const [vagas, setVagas] = useState(1)
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    const { error } = await supabase.from('consultas_horarios').insert({
      data,
      hora,
      especialidade,
      profissional,
      modalidade,
      local: modalidade === 'presencial' ? local : '',
      duracao_min: duracao,
      vagas,
      observacao,
      publicado: true,
      criado_por: autorId,
    })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    onSalvo()
  }

  return (
    <form onSubmit={submeter} className="auth__form">
      <label className="auth__campo"><span>Data</span>
        <input type="date" required value={data} onChange={(e) => setData(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Hora</span>
        <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} />
      </label>
      <label className="auth__campo"><span>Especialidade</span>
        <select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)}>
          {ESPECIALIDADES.map((esp) => <option key={esp} value={esp}>{esp}</option>)}
        </select>
      </label>
      <label className="auth__campo"><span>Profissional (opcional)</span>
        <input value={profissional} onChange={(e) => setProfissional(e.target.value)} placeholder="Dra. Ana" />
      </label>
      <label className="auth__campo"><span>Modalidade</span>
        <select value={modalidade} onChange={(e) => setModalidade(e.target.value as 'online' | 'presencial')}>
          <option value="online">Online (vídeo)</option>
          <option value="presencial">Presencial</option>
        </select>
      </label>
      {modalidade === 'presencial' && (
        <label className="auth__campo"><span>Local</span>
          <input required value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Templo central, sala 2" />
        </label>
      )}
      <label className="auth__campo"><span>Duração (min)</span>
        <input type="number" min={5} required value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} />
      </label>
      <label className="auth__campo"><span>Vagas (1 = consulta individual)</span>
        <input type="number" min={1} required value={vagas} onChange={(e) => setVagas(Number(e.target.value))} />
      </label>
      <label className="auth__campo"><span>Observação (opcional)</span>
        <input value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      </label>
      {erro && <p className="auth__erro">{erro}</p>}
      <button type="submit" className="botao botao--primario" disabled={enviando}>
        {enviando ? 'Salvando…' : 'Publicar horário'}
      </button>
    </form>
  )
}
