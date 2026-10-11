import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  desmarcarConsulta,
  marcarConsulta,
  useHorariosConsulta,
  useMinhasConsultas,
} from '../lib/consultas'
import type { HorarioConsulta, ConsultaMinha } from '../lib/tipos'

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const ESPECIALIDADES: Record<string, string> = {
  clinico: 'Clínico geral',
  pediatria: 'Pediatria',
  psicologia: 'Psicologia',
  psiquiatria: 'Psiquiatria',
  nutricao: 'Nutrição',
  ginecologia: 'Ginecologia',
  odontologia: 'Odontologia',
  outra: 'Atendimento',
}

const SITUACAO: Record<string, { texto: string; cor: string }> = {
  marcada:    { texto: 'Marcada',           cor: 'var(--dourado-claro)' },
  atendida:   { texto: 'Atendida',          cor: 'var(--txt-medio)' },
  cancelada:  { texto: 'Desmarcada',        cor: 'var(--txt-medio)' },
  faltou:     { texto: 'Não compareceu',    cor: '#ff6b6b' },
}

function porExtenso(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  const quando = new Date(Date.UTC(a, m - 1, d, 12))
  return `${DIAS[quando.getUTCDay()]}, ${d} de ${MESES[m - 1]}`
}
const comoTitulo = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const hhmm = (hora: string) => hora.slice(0, 5)

export function AgendarConsulta() {
  const { session, profile } = useAuth()
  const logado = !!session
  const horarios = useHorariosConsulta()
  const minhas = useMinhasConsultas(logado)

  const [escolhido, setEscolhido] = useState<HorarioConsulta | null>(null)
  const [telefone, setTelefone] = useState('')
  const [motivo, setMotivo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [recado, setRecado] = useState<string | null>(null)

  const porDia = useMemo(() => {
    const mapa = new Map<string, HorarioConsulta[]>()
    for (const h of horarios.data) {
      const lista = mapa.get(h.data) ?? []
      lista.push(h)
      mapa.set(h.data, lista)
    }
    return [...mapa.entries()]
  }, [horarios.data])

  const marcadas = minhas.data.filter((c) => c.status === 'marcada')

  function abrir(h: HorarioConsulta) {
    setEscolhido(h)
    setTelefone('')
    setMotivo('')
    setRecado(null)
  }

  async function confirmar() {
    if (!escolhido) return
    if (telefone.trim().length < 8) {
      setRecado('Deixe um telefone para a equipe confirmar.')
      return
    }
    setOcupado(true)
    const r = await marcarConsulta(escolhido.id, {
      nome: profile?.nome ?? '',
      telefone: telefone.trim(),
      motivo: motivo.trim(),
    })
    setOcupado(false)
    setRecado(r.recado)
    if (r.ok) {
      setEscolhido(null)
      horarios.reload()
      minhas.reload()
    } else {
      horarios.reload()
    }
  }

  async function desmarcar(c: ConsultaMinha) {
    setOcupado(true)
    const erro = await desmarcarConsulta(c.id)
    setOcupado(false)
    setRecado(erro ? `Não deu para desmarcar: ${erro}` : 'Consulta desmarcada.')
    minhas.reload()
    horarios.reload()
  }

  return (
    <section className="saude__secao">
      <h2 className="saude__titulo">Agendar consulta</h2>
      <p className="saude__texto">
        Horários abertos pela equipe do Evangelho. Escolha um e a gente confirma por telefone.
      </p>

      {recado && <p className="saude__recado">{recado}</p>}

      {!logado && (
        <div className="saude__caixa">
          <p className="saude__caixa-titulo">Entre para marcar</p>
          <p className="saude__caixa-texto">
            A consulta fica na sua conta, e é por ela que a equipe liga para confirmar.
          </p>
          <Link to="/entrar" className="botao botao--primario">Entrar</Link>
        </div>
      )}

      {logado && horarios.loading && <p className="saude__caixa saude__caixa--centro">Carregando horários…</p>}
      {logado && !horarios.loading && horarios.error && (
        <p className="saude__caixa">{horarios.error}</p>
      )}

      {logado && !horarios.loading && !horarios.error && porDia.length === 0 && (
        <div className="saude__caixa">
          <p className="saude__caixa-titulo">Nenhum horário aberto agora.</p>
          <p className="saude__caixa-texto">
            {horarios.brutos === 0
              ? 'A equipe publica os horários aqui assim que tiver agenda. Enquanto isso, a telemedicina acima atende 24 horas.'
              : 'Os horários desta semana já foram todos preenchidos. Novos aparecem aqui assim que a equipe abrir. Enquanto isso, a telemedicina acima atende 24 horas.'}
          </p>
        </div>
      )}

      {logado && porDia.map(([dia, lista]) => (
        <div key={dia} className="saude__dia">
          <h3 className="saude__dia-titulo">{comoTitulo(porExtenso(dia))}</h3>
          <div className="saude__horarios">
            {lista.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => abrir(h)}
                className={`saude__horario${escolhido?.id === h.id ? ' saude__horario--ativo' : ''}`}
              >
                <span className="saude__horario-hora">{hhmm(h.hora)}</span>
                <span className="saude__horario-especialidade">
                  {ESPECIALIDADES[h.especialidade] ?? h.especialidade}
                  {h.profissional ? ` · ${h.profissional}` : ''}
                </span>
                <span className={`saude__horario-vagas${h.restantes <= 1 ? ' saude__horario-vagas--poucas' : ''}`}>
                  {h.modalidade === 'online' ? 'Por vídeo' : 'Presencial'} · {h.restantes === 1 ? 'última vaga' : `${h.restantes} vagas`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {escolhido && (
        <div className="saude__confirmar">
          <p className="saude__confirmar-titulo">
            {comoTitulo(porExtenso(escolhido.data))}, às {hhmm(escolhido.hora)}
          </p>
          <p className="saude__confirmar-meta">
            {ESPECIALIDADES[escolhido.especialidade] ?? escolhido.especialidade}
            {escolhido.profissional ? ` · ${escolhido.profissional}` : ''}
            {' · '}{escolhido.duracao_min} min
            {escolhido.modalidade === 'presencial' && escolhido.local ? ` · ${escolhido.local}` : ''}
          </p>
          {escolhido.observacao && (
            <p className="saude__confirmar-obs">{escolhido.observacao}</p>
          )}

          <label className="auth__campo">
            <span>Telefone para confirmar</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="(11) 90000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </label>

          <label className="auth__campo">
            <span>O que você precisa? (opcional)</span>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: dor de cabeça há três dias"
            />
          </label>

          <div className="saude__confirmar-acoes">
            <button
              type="button"
              onClick={() => void confirmar()}
              disabled={ocupado}
              className="botao botao--primario"
            >
              {ocupado ? 'Marcando…' : 'Confirmar consulta'}
            </button>
            <button
              type="button"
              onClick={() => setEscolhido(null)}
              className="botao botao--ghost"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {marcadas.length > 0 && (
        <div className="saude__minhas">
          <h3 className="saude__titulo">Suas consultas</h3>
          {minhas.data.filter((c) => c.status !== 'cancelada').map((c) => {
            const s = SITUACAO[c.status] ?? SITUACAO.marcada
            return (
              <div key={c.id} className="saude__minha">
                <p className="saude__minha-titulo">
                  {c.horario
                    ? `${comoTitulo(porExtenso(c.horario.data))}, às ${hhmm(c.horario.hora)}`
                    : 'Consulta marcada'}
                </p>
                {c.horario && (
                  <p className="saude__minha-meta">
                    {ESPECIALIDADES[c.horario.especialidade] ?? c.horario.especialidade}
                    {c.horario.profissional ? ` · ${c.horario.profissional}` : ''}
                    {' · '}{c.horario.modalidade === 'online' ? 'por vídeo' : 'presencial'}
                  </p>
                )}
                <p className="saude__minha-status" style={{ color: s.cor }}>{s.texto}</p>
                {c.status === 'marcada' && (
                  <button
                    type="button"
                    onClick={() => void desmarcar(c)}
                    disabled={ocupado}
                    className="botao botao--ghost botao--compacto"
                  >
                    Desmarcar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
