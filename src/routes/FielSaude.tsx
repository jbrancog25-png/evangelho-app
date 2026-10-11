import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AgendarConsulta } from '../components/AgendarConsulta'
import { telemedicina } from '../data/telemedicina'

/**
 * Saúde — portada fielmente do CONEX (conex-app/src/screens/HealthScreen.tsx).
 *
 * Visual claro (fundo branco, fio verde do símbolo). É a única tela do
 * Evangelho que foge do preto+dourado, de propósito: no CONEX funciona assim,
 * e a usuária preferiu copiar o design em vez de adaptar.
 *
 * O logotipo do CONEX aparece ao lado do título "Saúde" (como lá), mas o
 * crédito do rodapé diz "parceiro do Evangelho".
 */

/* -------------------------------------------- paleta e tintas (do CONEX) */

const simbolo = {
  laranja: '#FE8602',
  verde: '#017F77',
  azul: '#0174F6',
  vermelho: '#E81C18',
  laranjaEscuro: '#A85700',
  verdeClaro: '#2FC3B0',
  tinta: '#04222E',
}

const claro = {
  screen: '#FFFFFF',
  band: '#F6F5F2',
  panel: '#FFFFFF',
  border: '#E3E6EC',
  verde: simbolo.verde,
  ink: '#14223A',
  body: '#44506A',
  muted: '#68748C',
  faint: '#8B95A8',
}

const CAMPO = simbolo.verde
const ACAO = simbolo.laranja
const SOBRE_ACAO = simbolo.tinta
const CLARO = '#9EEDE4'
const RODIZIO = [simbolo.laranja, simbolo.verde, simbolo.azul, simbolo.vermelho]

/* -------------------------------------------------------------- ícones */

const T = {
  fill: 'none',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ArteConsulta = () => (
  <svg viewBox="0 0 170 124" width="112" height="82" aria-hidden="true">
    <rect x="26" y="14" width="70" height="96" rx="11" fill="#0B3A73" />
    <rect x="32" y="24" width="58" height="76" rx="6" fill="#F2F5F8" />
    <circle cx="61" cy="50" r="12" fill={ACAO} />
    <path d="M41 92c0-11 9-18 20-18s20 7 20 18z" fill={ACAO} />
    <path d="M116 28v20a15 15 0 0 0 30 0V28" fill="none" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
    <circle cx="116" cy="26" r="5" fill="#fff" />
    <circle cx="146" cy="26" r="5" fill="#fff" />
    <path d="M131 63v12" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
    <circle cx="131" cy="84" r="11" fill={ACAO} />
    <circle cx="131" cy="84" r="4.5" fill="#0B3A73" />
  </svg>
)

const Video = ({ cor = '#fff' }: { cor?: string }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.6" y="6" width="13" height="12" rx="3" stroke={cor} {...T} />
    <path d="M15.6 11l5.8-3.4v8.8L15.6 13z" stroke={cor} {...T} />
  </svg>
)

const Relogio = ({ cor }: { cor: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.8" stroke={cor} {...T} />
    <path d="M12 7v5.4l3.4 2" stroke={cor} {...T} />
  </svg>
)

const Selo = ({ cor }: { cor: string }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2.8l2.6 1.9 3.2-.2.9 3.1 2.5 2-1.5 2.9 1.5 2.9-2.5 2-.9 3.1-3.2-.2L12 21.2l-2.6-1.9-3.2.2-.9-3.1-2.5-2L4.3 11.5 2.8 8.6l2.5-2 .9-3.1 3.2.2z" stroke={cor} {...T} />
    <path d="M8.6 12l2.4 2.4 4.4-4.6" stroke={cor} {...T} />
  </svg>
)

/* --------------------------------------------------------------- peças */

const abrir = (link: string) => window.open(link, '_blank', 'noopener,noreferrer')

function Cabecalho({ onVoltar }: { onVoltar: () => void }) {
  return (
    <div
      style={{
        padding: '16px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={onVoltar}
        aria-label="Voltar"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          border: `1px solid ${claro.border}`,
          background: claro.panel,
          fontSize: 22,
          fontWeight: 900,
          color: claro.ink,
          cursor: 'pointer',
          fontFamily: 'inherit',
          lineHeight: 1,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        ‹
      </button>
      <div style={{ fontSize: 19, fontWeight: 900, color: claro.ink, flex: 1 }}>Saúde</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          flexShrink: 0,
        }}
      >
        <img
          src="/assets/conex-mark.png"
          alt=""
          width={30}
          height={30}
          style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, display: 'block' }}
        />
        <span style={{ fontSize: 13, fontWeight: 900, color: claro.ink, letterSpacing: '0.4px' }}>
          CONEX
        </span>
      </div>
    </div>
  )
}

function Adesao() {
  return (
    <div
      style={{
        background: claro.panel,
        border: `1px solid ${CAMPO}`,
        borderRadius: 20,
        padding: '18px 16px 16px',
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 900, color: claro.ink, marginBottom: 4 }}>
        Faça sua adesão
      </div>
      <div style={{ fontSize: 13.5, color: claro.body, fontWeight: 600, lineHeight: 1.5, marginBottom: 14 }}>
        Escolha o plano e assine pela {telemedicina.parceiro}, parceira do Evangelho. O pagamento é
        feito no site deles.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {telemedicina.planos.map((plano) => (
          <button
            key={plano.id}
            type="button"
            onClick={() => abrir(plano.url)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: '100%',
              textAlign: 'left',
              background: claro.panel,
              border: `1.5px solid ${claro.border}`,
              borderRadius: 14,
              padding: '13px 15px',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 900, color: claro.ink, lineHeight: 1.25 }}>
                {plano.nome}
              </span>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: claro.muted }}>
                {plano.para}
              </span>
            </span>
            <span style={{ flexShrink: 0, textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 15.5, fontWeight: 900, color: CAMPO, lineHeight: 1.2 }}>
                {plano.preco}
              </span>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: claro.muted }}>
                {plano.periodo}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Chamada() {
  const aberto = telemedicina.atendimentoUrl

  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(160deg, ${CAMPO} 0%, #013D47 100%)`,
        border: `1px solid ${claro.border}`,
        borderRadius: 20,
        padding: '18px 18px 20px',
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 10, right: -6, opacity: 0.9 }}>
        <ArteConsulta />
      </div>

      <div style={{ position: 'relative', maxWidth: '68%' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: ACAO,
            color: SOBRE_ACAO,
            fontSize: 11.5,
            fontWeight: 900,
            letterSpacing: 0.5,
            padding: '6px 12px',
            borderRadius: 100,
            marginBottom: 12,
          }}
        >
          <Video cor={SOBRE_ACAO} /> TELEMEDICINA
        </span>

        <div style={{ fontSize: 'clamp(19px, 5.7vw, 23px)', fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>
          Consulta por vídeo <span style={{ color: CLARO }}>a qualquer hora</span>
        </div>

        <div
          style={{
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.86)',
            fontWeight: 600,
            lineHeight: 1.45,
            margin: '10px 0 0',
            width: 'calc(100% + 32px)',
          }}
        >
          Fale com um profissional de saúde pelo celular, sem fila e sem sair de casa.
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: 8,
          marginTop: 16,
          flexWrap: 'wrap',
        }}
      >
        {telemedicina.numeros.map((n) => (
          <span
            key={n.valor + n.texto}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 13,
              padding: '10px 8px',
            }}
          >
            <span style={{ display: 'block', fontSize: 16.5, fontWeight: 900, color: CLARO }}>
              {n.valor}
            </span>
            <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.82)', lineHeight: 1.3, marginTop: 2 }}>
              {n.texto}
            </span>
          </span>
        ))}
      </div>

      {aberto ? (
        <button
          type="button"
          onClick={() => abrir(aberto)}
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: ACAO,
            border: 'none',
            borderRadius: 100,
            padding: '16px 18px',
            color: SOBRE_ACAO,
            fontSize: 16,
            fontWeight: 900,
            fontFamily: 'inherit',
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          <Video cor={SOBRE_ACAO} /> Iniciar atendimento
        </button>
      ) : (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            background: 'rgba(255,255,255,0.1)',
            border: '1px dashed rgba(255,255,255,0.34)',
            borderRadius: 14,
            padding: '13px 14px',
            marginTop: 16,
          }}
        >
          <span style={{ marginTop: 1 }}>
            <Relogio cor={CLARO} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Em breve para você</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.84)', fontWeight: 600, lineHeight: 1.45, marginTop: 3 }}>
              O Evangelho está abrindo o atendimento com a {telemedicina.parceiro}. Assim que
              estiver liberado, o botão aparece aqui nesta tela.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          display: 'block',
          padding: '12px 0 0',
          fontSize: 12.5,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.72)',
          textAlign: 'center',
        }}
      >
        Atendimento da {telemedicina.parceiro}, parceira do Evangelho
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: claro.ink, marginBottom: 12 }}>{titulo}</div>
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- tela */

export default function FielSaude() {
  const navegar = useNavigate()

  return (
    <div style={{ minHeight: '100%', background: claro.screen, color: claro.ink }}>
      <Cabecalho onVoltar={() => navegar('/')} />

      <div style={{ padding: '4px 20px 34px' }}>
        <Adesao />
        <Chamada />
        <AgendarConsulta paleta={{ ...claro, acao: ACAO, sobreAcao: SOBRE_ACAO, aviso: simbolo.laranjaEscuro, campo: CAMPO }} />

        <Secao titulo="Como funciona">
          {telemedicina.passos.map((p, n) => (
            <div
              key={p.titulo}
              style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 14 }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: ACAO,
                  color: SOBRE_ACAO,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {n + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: claro.ink }}>{p.titulo}</div>
                <div style={{ fontSize: 13.5, color: claro.body, fontWeight: 600, lineHeight: 1.45, marginTop: 2 }}>
                  {p.texto}
                </div>
              </div>
            </div>
          ))}
        </Secao>

        <Secao titulo="Com quem você fala">
          {telemedicina.atendimentos.map((a, i) => (
            <div
              key={a.titulo}
              style={{
                background: claro.panel,
                border: `1px solid ${claro.border}`,
                borderRadius: 16,
                padding: 15,
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: RODIZIO[i % RODIZIO.length],
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 900, color: claro.ink }}>{a.titulo}</span>
              </div>
              <div style={{ fontSize: 13.5, color: claro.body, fontWeight: 600, lineHeight: 1.5 }}>
                {a.texto}
              </div>
            </div>
          ))}
        </Secao>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            background: claro.band,
            border: `1px solid ${claro.border}`,
            borderRadius: 16,
            padding: 15,
            marginBottom: 26,
          }}
        >
          <Selo cor={ACAO} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: claro.ink }}>
              {telemedicina.validade.titulo}
            </div>
            <div style={{ fontSize: 13, color: claro.body, fontWeight: 600, lineHeight: 1.5, marginTop: 4 }}>
              {telemedicina.validade.texto}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
