import { useEffect, useState, type ReactNode } from 'react'
import { TocadorContext } from '../hooks/useTocador'
import { paginaDoSoundCloud, playlistDoSoundCloud, type Playlist } from '../lib/soundcloud'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Louvor } from '../lib/tipos'

/**
 * Guarda a playlist em execução acima das rotas, para a música seguir de tela
 * em tela. Quando o fiel loga, carrega a primeira playlist publicada do painel
 * — se existir. Sem louvores cadastrados o player fica desligado (a barra não
 * aparece, e /louvores explica como cadastrar).
 */
export function TocadorProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [tocando, tocar] = useState<Playlist | null>(null)

  useEffect(() => {
    if (!session) {
      tocar(null)
      return
    }
    supabase
      .from('louvores')
      .select('*')
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        const lista = (data ?? []) as Louvor[]
        const primeiraDoSoundCloud = lista.find((l) => playlistDoSoundCloud(l.url))
        if (primeiraDoSoundCloud) {
          tocar({
            id: primeiraDoSoundCloud.id,
            titulo: primeiraDoSoundCloud.titulo,
            url: primeiraDoSoundCloud.url,
            pagina: paginaDoSoundCloud(primeiraDoSoundCloud.url),
            autor: primeiraDoSoundCloud.artista ?? '',
            descricao: primeiraDoSoundCloud.playlist ?? '',
          })
        }
      })
  }, [session])

  return <TocadorContext.Provider value={{ tocando, tocar }}>{children}</TocadorContext.Provider>
}
