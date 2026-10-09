import { createContext, useContext } from 'react'
import type { Playlist } from '../lib/soundcloud'

type TocadorState = {
  /** A playlist no player. Vazia até a pessoa abrir Louvores pela primeira vez. */
  tocando: Playlist | null
  tocar: (p: Playlist) => void
}

export const TocadorContext = createContext<TocadorState | null>(null)

export function useTocador() {
  const ctx = useContext(TocadorContext)
  if (!ctx) throw new Error('useTocador precisa estar dentro de <TocadorProvider>')
  return ctx
}
