import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/vida-em-cristo.jpg'
import './Admin.css'

export default function Admin() {
  const { profile, signOut } = useAuth()

  return (
    <div className="admin">
      <header className="admin__topo">
        <Link to="/" className="admin__marca">
          <img src={logo} alt="" />
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
      </nav>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
