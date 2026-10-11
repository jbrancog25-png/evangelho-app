import { Link } from 'react-router-dom'
import { telemedicina } from '../data/telemedicina'
import { AgendarConsulta } from '../components/AgendarConsulta'
import './Feed.css'
import './FielSaude.css'

const abrir = (link: string) => window.open(link, '_blank', 'noopener,noreferrer')

export default function FielSaude() {
  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Saúde</h1>
      </header>

      {/* ── Adesão ───────────────────────────────────────────── */}
      <section className="saude__adesao">
        <h2 className="saude__titulo">Faça sua adesão</h2>
        <p className="saude__texto">
          Escolha o plano e assine pela {telemedicina.parceiro}, parceira do Evangelho. O pagamento
          é feito no site deles.
        </p>
        <ul className="saude__planos">
          {telemedicina.planos.map((plano) => (
            <li key={plano.id}>
              <button type="button" className="saude__plano" onClick={() => abrir(plano.url)}>
                <span className="saude__plano-info">
                  <span className="saude__plano-nome">{plano.nome}</span>
                  <span className="saude__plano-para">{plano.para}</span>
                </span>
                <span className="saude__plano-preco">
                  <span className="saude__plano-valor">{plano.preco}</span>
                  <span className="saude__plano-periodo">{plano.periodo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Chamada / Iniciar atendimento ─────────────────────── */}
      <section className="saude__chamada">
        <span className="saude__chamada-selo">▶ TELEMEDICINA</span>
        <h2 className="saude__chamada-titulo">
          Consulta por vídeo <span>a qualquer hora</span>
        </h2>
        <p className="saude__chamada-texto">
          Fale com um profissional de saúde pelo celular, sem fila e sem sair de casa.
        </p>

        <ul className="saude__numeros">
          {telemedicina.numeros.map((n) => (
            <li key={n.valor + n.texto} className="saude__numero">
              <span className="saude__numero-valor">{n.valor}</span>
              <span className="saude__numero-texto">{n.texto}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => abrir(telemedicina.atendimentoUrl)}
          className="botao botao--primario saude__chamada-botao"
        >
          ▶ Iniciar atendimento
        </button>

        <p className="saude__chamada-credito">
          Atendimento da {telemedicina.parceiro}, parceira do Evangelho
        </p>
      </section>

      {/* ── Agendar consulta ──────────────────────────────────── */}
      <AgendarConsulta />

      {/* ── Como funciona ─────────────────────────────────────── */}
      <section className="saude__secao">
        <h2 className="saude__titulo">Como funciona</h2>
        <ol className="saude__passos">
          {telemedicina.passos.map((p, n) => (
            <li key={p.titulo} className="saude__passo">
              <span className="saude__passo-num">{n + 1}</span>
              <div>
                <p className="saude__passo-titulo">{p.titulo}</p>
                <p className="saude__passo-texto">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Com quem você fala ────────────────────────────────── */}
      <section className="saude__secao">
        <h2 className="saude__titulo">Com quem você fala</h2>
        <ul className="saude__atendimentos">
          {telemedicina.atendimentos.map((a) => (
            <li key={a.titulo} className="saude__atendimento">
              <p className="saude__atendimento-titulo">{a.titulo}</p>
              <p className="saude__atendimento-texto">{a.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Validade jurídica ─────────────────────────────────── */}
      <section className="saude__validade">
        <p className="saude__validade-titulo">✓ {telemedicina.validade.titulo}</p>
        <p className="saude__validade-texto">{telemedicina.validade.texto}</p>
      </section>
    </div>
  )
}
