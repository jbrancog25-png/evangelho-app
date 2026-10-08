import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import RotaProtegida from './components/RotaProtegida'
import Splash from './components/Splash'
import HomeScreen from './screens/HomeScreen'
import Entrar from './routes/Entrar'
import Cadastrar from './routes/Cadastrar'
import Admin from './routes/Admin'
import AdminIgrejas from './routes/AdminIgrejas'
import AdminPastores from './routes/AdminPastores'
import AdminEventos from './routes/AdminEventos'
import AdminCampanhas from './routes/AdminCampanhas'
import AdminVagas from './routes/AdminVagas'
import AdminVersiculos from './routes/AdminVersiculos'
import AdminCursos from './routes/AdminCursos'
import AdminParceiros from './routes/AdminParceiros'
import AdminCestas from './routes/AdminCestas'
import AdminBeneficios from './routes/AdminBeneficios'
import PastorNovaIgreja from './routes/PastorNovaIgreja'
import PastorDashboard from './routes/PastorDashboard'
import PastorIgreja from './routes/PastorIgreja'
import FielEventos from './routes/FielEventos'
import FielVagas from './routes/FielVagas'
import FielCursos from './routes/FielCursos'
import FielParceiros from './routes/FielParceiros'
import FielCestas from './routes/FielCestas'
import FielBeneficios from './routes/FielBeneficios'
import Perfil from './routes/Perfil'
import EmBreve from './routes/EmBreve'
import SemConfiguracao from './routes/SemConfiguracao'
import { supabaseConfigurada } from './lib/supabase'
import './App.css'

export default function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true)

  if (!supabaseConfigurada) {
    return (
      <div className="app">
        <main className="app__tela">
          <SemConfiguracao />
        </main>
      </div>
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          {mostrarSplash && <Splash onConcluir={() => setMostrarSplash(false)} />}
          <main className="app__tela">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/cadastrar" element={<Cadastrar />} />
              <Route
                path="/pastor"
                element={
                  <RotaProtegida rolesPermitidas={['pastor', 'super_admin']}>
                    <PastorDashboard />
                  </RotaProtegida>
                }
              />
              <Route
                path="/pastor/nova-igreja"
                element={
                  <RotaProtegida rolesPermitidas={['pastor', 'super_admin']}>
                    <PastorNovaIgreja />
                  </RotaProtegida>
                }
              />
              <Route
                path="/pastor/igreja/:id"
                element={
                  <RotaProtegida rolesPermitidas={['pastor', 'super_admin']}>
                    <PastorIgreja />
                  </RotaProtegida>
                }
              />
              <Route
                path="/admin"
                element={
                  <RotaProtegida rolesPermitidas={['super_admin']}>
                    <Admin />
                  </RotaProtegida>
                }
              >
                <Route index element={<Navigate to="igrejas" replace />} />
                <Route path="igrejas" element={<AdminIgrejas />} />
                <Route path="pastores" element={<AdminPastores />} />
                <Route path="eventos" element={<AdminEventos />} />
                <Route path="campanhas" element={<AdminCampanhas />} />
                <Route path="vagas" element={<AdminVagas />} />
                <Route path="versiculos" element={<AdminVersiculos />} />
                <Route path="cursos" element={<AdminCursos />} />
                <Route path="parceiros" element={<AdminParceiros />} />
                <Route path="cestas" element={<AdminCestas />} />
                <Route path="beneficios" element={<AdminBeneficios />} />
              </Route>

              <Route
                path="/eventos"
                element={
                  <RotaProtegida>
                    <FielEventos />
                  </RotaProtegida>
                }
              />
              <Route
                path="/vagas"
                element={
                  <RotaProtegida>
                    <FielVagas />
                  </RotaProtegida>
                }
              />
              <Route
                path="/cursos"
                element={
                  <RotaProtegida>
                    <FielCursos />
                  </RotaProtegida>
                }
              />
              <Route
                path="/parceiros"
                element={
                  <RotaProtegida>
                    <FielParceiros />
                  </RotaProtegida>
                }
              />
              <Route
                path="/cestas"
                element={
                  <RotaProtegida>
                    <FielCestas />
                  </RotaProtegida>
                }
              />
              <Route
                path="/beneficios"
                element={
                  <RotaProtegida>
                    <FielBeneficios />
                  </RotaProtegida>
                }
              />
              <Route
                path="/perfil"
                element={
                  <RotaProtegida>
                    <Perfil />
                  </RotaProtegida>
                }
              />
              <Route
                path="/em-breve/:area"
                element={
                  <RotaProtegida>
                    <EmBreve />
                  </RotaProtegida>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
