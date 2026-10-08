import { Link, useParams } from 'react-router-dom'
import logo from '../assets/vida-em-cristo.jpg'
import './Feed.css'

const TITULOS: Record<string, string> = {
  esportes: 'Esportes',
  shows: 'Shows',
  cultura: 'Cultura',
  educacao: 'Educação',
  cursos: 'Cursos',
  saude: 'Saúde',
  sangue: 'Doação de sangue',
  'cestas-basicas': 'Cestas básicas',
  missoes: 'Missões',
  beneficios: 'Clube de benefícios',
  parceiros: 'Entidades parceiras',
  ingles: 'Inglês',
  carteira: 'Carteira',
  ranking: 'Ranking',
  perfil: 'Perfil',
  biblia: 'Bíblia',
  louvores: 'Louvores',
  dizimo: 'Dízimo e ofertas',
  desapego: 'Desapego',
  cultos: 'Cultos',
}

export default function EmBreve() {
  const { area } = useParams<{ area: string }>()
  const titulo = (area && TITULOS[area]) || 'Em breve'

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">{titulo}</h1>
      </header>

      <div className="em-breve">
        <img src={logo} alt="" className="em-breve__logo" />
        <h2 className="em-breve__titulo">Em construção</h2>
        <p className="em-breve__texto">
          Essa área está sendo preparada com muito carinho pela equipe do Evangelho.
          Em breve você poderá acessar aqui dentro do app.
        </p>
        <Link to="/" className="botao botao--primario">Voltar para a home</Link>
      </div>
    </div>
  )
}
