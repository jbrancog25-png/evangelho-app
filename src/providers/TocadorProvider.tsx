import { useState, type ReactNode } from 'react'
import { TocadorContext } from '../hooks/useTocador'
import type { Playlist } from '../lib/soundcloud'

/** Guarda a playlist em execução acima das rotas, para a música seguir de tela em tela. */
export function TocadorProvider({ children }: { children: ReactNode }) {
  const [tocando, tocar] = useState<Playlist | null>(null)
  return <TocadorContext.Provider value={{ tocando, tocar }}>{children}</TocadorContext.Provider>
}
