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

/**
 * Agendar consulta — portado do CONEX com inline styles para casar com a
 * tela clara da Saúde.
 */

type Paleta = {
  panel: string
  border: string
  ink: string
  body: string
  muted: string
  faint: string
  band: string
  verde: string
  campo: string
  acao: string
  sobreAcao: string
  aviso: string
}

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

const SITUACAO: Record<string, { texto: string }> = {
  marcada:    { texto: 'Marcada' },
  atendida:   { texto: 'Atendida' },
  cancelada:  { texto: 'Desmarcada' },
  faltou:     { texto: 'Não compareceu' },
}

function porExtenso(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  const quando = new Date(Date.UTC(a, m - 1, d, 12))
  return `${DIAS[quando.getUTCDay()]}, ${d} de ${MESES[m - 1]}`
}
const comoTitulo = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const hhmm = (hora: string) => hora.slice(0, 5)

export function AgendarConsulta({ paleta }: { paleta: Paleta }) {
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

  const caixa = {
    background: paleta.panel,
    border: `1px dashed ${paleta.border}`,
    borderRadius: 16,
    padding: 20,
    textAlign: 'center' as const,
    color: paleta.muted,
    fontSize: 13.5,
    fontWeight: 600,
    lineHeight: 1.5,
  }

  const rotulo = {
    display: 'block',
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
    color: paleta.muted,
    marginTop: 10,
  }

  const campo = {
    width: '100%',
    boxSizing: 'border-box' as const,
    marginTop: 6,
    padding: '12px 13px',
    borderRadius: 12,
    border: `1px solid ${paleta.border}`,
    background: '#FFFFFF',
    color: paleta.ink,
    fontSize: 15,
    fontFamily: 'inherit',
  }

  const botaoCheio = {
    border: 'none',
    background: '#0174F6',
    color: '#FFFFFF',
    fontFamily: 'inherit',
    fontWeight: 900,
    fontSize: 14.5,
    padding: '13px 18px',
    borderRadius: 12,
    cursor: 'pointer',
  }

  const botaoVazio = {
    border: `1px solid ${paleta.border}`,
    background: 'transparent',
    color: paleta.ink,
    fontFamily: 'inherit',
    fontWeight: 800,
    fontSize: 14,
    padding: '12px 16px',
    borderRadius: 12,
    cursor: 'pointer',
  }

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <img
          src="/assets/conex-mark.png"
          alt=""
          width={28}
          height={28}
          style={{ width: 28, height: 28, borderRadius: 7, display: 'block' }}
        />
        <div style={{ fontSize: 16, fontWeight: 900, color: paleta.ink }}>Agendar consulta</div>
      </div>
      <div style={{ fontSize: 13, color: paleta.muted, fontWeight: 600, marginBottom: 14 }}>
        Horários abertos pela equipe do Evangelho. Escolha um e a gente confirma por telefone.
      </div>

      {recado && (
        <div style={{ ...caixa, borderStyle: 'solid', color: paleta.ink, marginBottom: 12, textAlign: 'left' }}>
          {recado}
        </div>
      )}

      {!logado && (
        <div style={{ ...caixa, textAlign: 'left' }}>
          <div style={{ color: paleta.ink, fontWeight: 800, marginBottom: 6 }}>Entre para marcar</div>
          <div style={{ marginBottom: 12 }}>
            A consulta fica na sua conta, e é por ela que a equipe liga para confirmar.
          </div>
          <Link to="/entrar" style={{ ...botaoCheio, display: 'inline-block', textDecoration: 'none' }}>
            Entrar
          </Link>
        </div>
      )}

      {logado && horarios.loading && <div style={caixa}>Carregando horários…</div>}

      {logado && !horarios.loading && horarios.error && (
        <div style={{ ...caixa, textAlign: 'left', borderStyle: 'solid' }}>{horarios.error}</div>
      )}

      {logado && !horarios.loading && !horarios.error && porDia.length === 0 && (
        <div style={{ ...caixa, textAlign: 'left' }}>
          <div style={{ color: paleta.ink, fontWeight: 800, marginBottom: 6 }}>
            Nenhum horário aberto agora.
          </div>
          <div>
            {horarios.brutos === 0
              ? 'A equipe publica os horários aqui assim que tiver agenda. Enquanto isso, a telemedicina acima atende 24 horas.'
              : 'Os horários desta semana já foram todos preenchidos. Novos aparecem aqui assim que a equipe abrir. Enquanto isso, a telemedicina acima atende 24 horas.'}
          </div>
        </div>
      )}

      {logado && porDia.map(([dia, lista]) => (
        <div key={dia} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: paleta.body, marginBottom: 8 }}>
            {comoTitulo(porExtenso(dia))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lista.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => abrir(h)}
                style={{
                  flex: '1 1 46%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  textAlign: 'left',
                  background: paleta.panel,
                  border: `1px solid ${escolhido?.id === h.id ? paleta.acao : paleta.border}`,
                  borderRadius: 14,
                  padding: '11px 13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ display: 'block', fontSize: 16, fontWeight: 900, color: paleta.ink }}>
                  {hhmm(h.hora)}
                </span>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: paleta.muted, marginTop: 2, lineHeight: 1.3 }}>
                  {ESPECIALIDADES[h.especialidade] ?? h.especialidade}
                  {h.profissional ? ` · ${h.profissional}` : ''}
                </span>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: h.restantes <= 1 ? paleta.aviso : paleta.faint, marginTop: 4 }}>
                  {h.modalidade === 'online' ? 'Por vídeo' : 'Presencial'}
                  {' · '}
                  {h.restantes === 1 ? 'última vaga' : `${h.restantes} vagas`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {escolhido && (
        <div
          style={{
            background: paleta.panel,
            border: `1.5px solid ${paleta.acao}`,
            borderRadius: 16,
            padding: 16,
            marginTop: 4,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900, color: paleta.ink }}>
            {comoTitulo(porExtenso(escolhido.data))}, às {hhmm(escolhido.hora)}
          </div>
          <div style={{ fontSize: 12.5, color: paleta.muted, fontWeight: 600, margin: '4px 0 12px' }}>
            {ESPECIALIDADES[escolhido.especialidade] ?? escolhido.especialidade}
            {escolhido.profissional ? ` · ${escolhido.profissional}` : ''}
            {' · '}{escolhido.duracao_min} min
            {escolhido.modalidade === 'presencial' && escolhido.local ? ` · ${escolhido.local}` : ''}
          </div>
          {escolhido.observacao && (
            <div style={{ fontSize: 12.5, color: paleta.body, fontWeight: 600, marginBottom: 12 }}>
              {escolhido.observacao}
            </div>
          )}

          <label style={rotulo}>
            Telefone para confirmar
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              inputMode="tel"
              placeholder="(11) 90000-0000"
              style={campo}
            />
          </label>

          <label style={rotulo}>
            O que você precisa? (opcional)
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: dor de cabeça há três dias"
              style={campo}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => void confirmar()}
              disabled={ocupado}
              style={{ ...botaoCheio, flex: 1, opacity: ocupado ? 0.6 : 1 }}
            >
              {ocupado ? 'Marcando…' : 'Confirmar consulta'}
            </button>
            <button
              type="button"
              onClick={() => setEscolhido(null)}
              style={{ ...botaoVazio, flex: '0 0 auto' }}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {marcadas.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 900, color: paleta.ink, marginBottom: 10 }}>
            Suas consultas
          </div>
          {minhas.data
            .filter((c) => c.status !== 'cancelada')
            .map((c) => {
              const s = SITUACAO[c.status] ?? SITUACAO.marcada
              return (
                <div
                  key={c.id}
                  style={{
                    background: paleta.panel,
                    border: `1px solid ${paleta.border}`,
                    borderRadius: 14,
                    padding: '13px 15px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: paleta.ink }}>
                    {c.horario
                      ? `${comoTitulo(porExtenso(c.horario.data))}, às ${hhmm(c.horario.hora)}`
                      : 'Consulta marcada'}
                  </div>
                  {c.horario && (
                    <div style={{ fontSize: 12, color: paleta.muted, fontWeight: 600, marginTop: 2 }}>
                      {ESPECIALIDADES[c.horario.especialidade] ?? c.horario.especialidade}
                      {c.horario.profissional ? ` · ${c.horario.profissional}` : ''}
                      {' · '}
                      {c.horario.modalidade === 'online' ? 'por vídeo' : 'presencial'}
                    </div>
                  )}
                  <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 900, color: paleta.verde, marginTop: 8 }}>
                    {s.texto}
                  </div>
                  {c.status === 'marcada' && (
                    <button
                      type="button"
                      onClick={() => void desmarcar(c)}
                      disabled={ocupado}
                      style={{ ...botaoVazio, display: 'block', marginTop: 10, fontSize: 13 }}
                    >
                      Desmarcar
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
