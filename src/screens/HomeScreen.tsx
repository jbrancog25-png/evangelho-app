import { ChevronRightIcon, CompartilharIcon, LouvoresIcon, PhotoIcon } from '../components/Icons'
import logo from '../assets/vida-em-cristo.jpg'
import { atalhosExplorar, campanhas, usuario, versiculoDia } from '../data/home'
import type { AtalhoExplorar, AtalhoGrupo } from '../data/home'
import { igrejasSeguidas } from '../data/igrejas'
import IgrejasSeguidas from '../components/IgrejasSeguidas'
import './HomeScreen.css'

/** Acima de 9.999 usa separador de milhar; abaixo disso fica como no painel: "1240 pontos". */
const formatarPontos = (valor: number) =>
  valor > 9999 ? new Intl.NumberFormat('pt-BR').format(valor) : String(valor)

const gruposExplorar: Array<{ grupo: AtalhoGrupo; titulo: string }> = [
  { grupo: 'igreja', titulo: 'Da sua igreja' },
  { grupo: 'fieis', titulo: 'Para todos os fiéis' },
]

export default function HomeScreen() {
  return (
    <div className="home">
      <header className="home__marca">
        <img className="home__marca-logo" src={logo} alt="Igreja Mundial Vida em Cristo" />
      </header>

      <section className="home__saudacao" aria-label="Sua conta">
        <span className="home__avatar" aria-hidden="true">
          {usuario.nome.charAt(0).toUpperCase()}
        </span>
        <div className="home__saudacao-texto">
          <p className="home__saudacao-linha">{usuario.saudacao}</p>
          <p className="home__saudacao-nome">{usuario.nome}</p>
        </div>
        <button type="button" className="home__avisos">
          Avisos
          {usuario.temAvisosNaoLidos && (
            <span className="home__avisos-badge">
              <span className="sr-only">Você tem avisos não lidos</span>
            </span>
          )}
        </button>
      </section>

      <section className="card card--saldo" aria-label="Seu saldo">
        <div className="saldo__info">
          <p className="saldo__rotulo">Seu saldo</p>
          <p className="saldo__valor">{formatarPontos(usuario.saldoPontos)} pontos</p>
        </div>
        <button type="button" className="botao botao--primario">
          Carteira
        </button>
      </section>

      <section className="card versiculo" aria-labelledby="titulo-versiculo">
        <div className="versiculo__topo">
          <span id="titulo-versiculo" className="versiculo__rotulo">
            Versículo do dia
          </span>
          <button type="button" className="botao botao--ghost botao--compacto">
            <CompartilharIcon className="botao__icone" /> Compartilhar
          </button>
        </div>
        <p className="versiculo__texto">“{versiculoDia.texto}”</p>
        <p className="versiculo__referencia">{versiculoDia.referencia}</p>
      </section>

      <button type="button" className="card card--louvores">
        <span className="louvores__icone">
          <LouvoresIcon />
        </span>
        <span className="louvores__texto">
          <span className="louvores__titulo">Ouvir louvores</span>
          <span className="louvores__subtitulo">
            Música gospel grátis, enquanto você usa o app
          </span>
        </span>
        <ChevronRightIcon className="louvores__seta" />
      </button>

      <IgrejasSeguidas igrejas={igrejasSeguidas} />

      <section className="home__secao" aria-labelledby="titulo-campanhas">
        <h2 id="titulo-campanhas" className="home__secao-titulo">
          Campanhas em destaque
        </h2>
        <ul className="campanhas">
          {campanhas.map((campanha) => (
            <li key={campanha.id} className="campanha">
              <div className="campanha__midia">
                {campanha.imagem ? (
                  <img className="campanha__foto" src={campanha.imagem} alt="" />
                ) : (
                  <span className="campanha__placeholder">
                    <PhotoIcon className="campanha__placeholder-icone" />
                    Foto
                  </span>
                )}
              </div>
              <h3 className={`campanha__titulo campanha__titulo--${campanha.cor}`}>
                {campanha.titulo}
              </h3>
              <p className="campanha__descricao">{campanha.descricao}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home__secao home__secao--explorar" aria-labelledby="titulo-explorar">
        <h2 id="titulo-explorar" className="home__secao-titulo">
          Explorar
        </h2>

        {gruposExplorar.map(({ grupo, titulo }) => (
          <GrupoExplorar
            key={grupo}
            titulo={titulo}
            itens={atalhosExplorar.filter((a) => a.grupo === grupo)}
          />
        ))}
      </section>
    </div>
  )
}

function GrupoExplorar({ titulo, itens }: { titulo: string; itens: AtalhoExplorar[] }) {
  if (itens.length === 0) return null
  return (
    <div className="explorar-grupo">
      <h3 className="explorar-grupo__titulo">{titulo}</h3>
      <ul className="explorar">
        {itens.map(({ id, rotulo, Icone }) => (
          <li key={id} className="explorar__item">
            <button type="button" className="pilula">
              <span className="pilula__icone">
                <Icone />
              </span>
              <span className="pilula__rotulo">{rotulo}</span>
              <ChevronRightIcon className="pilula__seta" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
