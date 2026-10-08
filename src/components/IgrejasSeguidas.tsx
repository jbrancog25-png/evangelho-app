import { Link } from 'react-router-dom'
import type { IgrejaSeguida } from '../data/igrejas'
import { ChevronRightIcon } from './Icons'
import './IgrejasSeguidas.css'

type Props = {
  igrejas: IgrejaSeguida[]
}

export default function IgrejasSeguidas({ igrejas }: Props) {
  if (igrejas.length === 0) {
    return (
      <section className="igrejas home__secao" aria-labelledby="titulo-igrejas">
        <h2 id="titulo-igrejas" className="home__secao-titulo">
          Sua igreja
        </h2>
        <Link to="/igrejas" className="igrejas__vazio">
          <span className="igrejas__vazio-texto">
            <span className="igrejas__vazio-titulo">Siga uma igreja</span>
            <span className="igrejas__vazio-subtitulo">
              Receba a palavra, horário dos cultos e pedidos de oração no topo do seu feed.
            </span>
          </span>
          <ChevronRightIcon className="igrejas__vazio-seta" />
        </Link>
      </section>
    )
  }

  return (
    <section className="igrejas home__secao" aria-labelledby="titulo-igrejas">
      <h2 id="titulo-igrejas" className="home__secao-titulo">
        {igrejas.length === 1 ? 'Sua igreja' : 'Suas igrejas'}
      </h2>
      <ul className="igrejas__lista">
        {igrejas.map((igreja) => (
          <li key={igreja.id} className="igreja">
            <header className="igreja__cabecalho">
              <div className="igreja__identidade">
                <h3 className="igreja__nome">{igreja.nome}</h3>
                <p className="igreja__pastor">
                  {igreja.pastor} · {igreja.cidade}
                </p>
              </div>
            </header>

            <p className="igreja__palavra">
              <span className="igreja__palavra-rotulo">Palavra da semana</span>
              {igreja.palavra}
            </p>

            <dl className="igreja__detalhes">
              <div className="igreja__detalhe">
                <dt>Próximo culto</dt>
                <dd>
                  {igreja.proximoCulto.diaSemana} · {igreja.proximoCulto.hora}
                  <span className="igreja__detalhe-local">{igreja.proximoCulto.local}</span>
                </dd>
              </div>
              <div className="igreja__detalhe">
                <dt>Pedidos de oração</dt>
                <dd>
                  <button type="button" className="igreja__link">
                    {igreja.pedidosOracao} pedidos ativos
                    <ChevronRightIcon className="igreja__link-seta" />
                  </button>
                </dd>
              </div>
            </dl>

            <div className="igreja__acoes">
              <button type="button" className="botao botao--primario">
                {igreja.dizimoCta}
              </button>
              <button type="button" className="botao botao--ghost">
                Pedir oração
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Link to="/igrejas" className="igrejas__descobrir">
        + Descobrir outras igrejas
      </Link>
    </section>
  )
}
