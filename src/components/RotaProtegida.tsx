import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../lib/tipos'

type Props = {
  children: ReactNode
  /** Se omitido, basta estar autenticado. */
  rolesPermitidas?: UserRole[]
}

export default function RotaProtegida({ children, rolesPermitidas }: Props) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return <div className="carregando">Carregando…</div>
  }

  if (!session) {
    return <Navigate to="/entrar" replace />
  }

  if (rolesPermitidas && (!profile || !rolesPermitidas.includes(profile.role))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
