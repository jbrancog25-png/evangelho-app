import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Ao abrir uma página nova, ela começa do alto — e não na altura em que a
 * pessoa estava rolando a anterior. Quem rola é a janela.
 *
 * No "voltar" do navegador (POP) não mexe: aí o certo é o navegador devolver
 * a pessoa para onde ela estava.
 */
export default function VoltarAoTopo() {
  const { pathname } = useLocation()
  const tipo = useNavigationType()

  useLayoutEffect(() => {
    if (tipo !== 'POP') window.scrollTo(0, 0)
  }, [pathname, tipo])

  return null
}
