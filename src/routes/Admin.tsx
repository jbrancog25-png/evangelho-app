import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MarcaIgreja from '../components/MarcaIgreja'
import './Admin.css'

export default function Admin() {
  const { profile, signOut } = useAuth()

  return (
    <div className="admin">
      <header className="admin__topo">
        <Link to="/" className="admin__marca">
          <MarcaIgreja tamanho="mini" />
          <span>Administração Evangelho</span>
        </Link>
        <div className="admin__usuario">
          <span>{profile?.nome}</span>
          <button type="button" onClick={signOut} className="botao botao--ghost botao--compacto">
            Sair
          </button>
        </div>
      </header>

      <nav className="admin__nav">
        <NavLink to="/admin/igrejas" className="admin__nav-item">Igrejas</NavLink>
        <NavLink to="/admin/pastores" className="admin__nav-item">Pastores</NavLink>
        <NavLink to="/admin/eventos" className="admin__nav-item">Eventos</NavLink>
        <NavLink to="/admin/campanhas" className="admin__nav-item">Campanhas</NavLink>
        <NavLink to="/admin/vagas" className="admin__nav-item">Vagas</NavLink>
        <NavLink to="/admin/versiculos" className="admin__nav-item">Versículos</NavLink>
        <NavLink to="/admin/cursos" className="admin__nav-item">Cursos</NavLink>
        <NavLink to="/admin/parceiros" className="admin__nav-item">Parceiros</NavLink>
        <NavLink to="/admin/cestas" className="admin__nav-item">Cestas</NavLink>
        <NavLink to="/admin/beneficios" className="admin__nav-item">Benefícios</NavLink>
        <NavLink to="/admin/louvores" className="admin__nav-item">Louvores</NavLink>
        <NavLink to="/admin/sangue" className="admin__nav-item">Sangue</NavLink>
        <NavLink to="/admin/desapegos" className="admin__nav-item">Desapego</NavLink>
      </nav>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
