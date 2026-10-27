/**
 * O player de louvores do SoundCloud, trazido do Evangelho antigo
 * (conex-app/src/evangelho/comum.ts).
 */

/** Uma playlist do SoundCloud que o fiel pode ouvir. */
export type Playlist = {
  id: string
  titulo: string
  /** Link, endereço com o número ou código de incorporar — ver `playlistDoSoundCloud`. */
  url: string
  /** A página da playlist no SoundCloud, para o crédito embaixo do player. */
  pagina: string
  /** Quem publicou, como aparece no SoundCloud. */
  autor: string
  descricao: string
}

/**
 * Playlist que toca quando nenhum louvor do SoundCloud foi cadastrado no
 * painel — para a tela nunca abrir vazia.
 *
 * A URL é a da própria página pública da playlist (o widget aceita esse
 * formato). Antes era o URN `soundcloud:playlists:2178933647` encoded dentro
 * de `api.soundcloud.com/playlists/...`, mas em algum momento o SoundCloud
 * deixou de reconhecer esse formato e o widget passou a mostrar "playlist
 * não encontrada". A página direta é mais estável.
 */
export const PLAYLIST_PADRAO: Playlist = {
  id: 'padrao',
  titulo: 'Louvores 2026',
  url: 'https://soundcloud.com/baixarmusicagospel/sets/louvores-2025-2026',
  pagina: 'https://soundcloud.com/baixarmusicagospel/sets/louvores-2025-2026',
  autor: 'Música Gospel',
  descricao: 'Gospel mais tocadas, para ouvir em qualquer hora do dia.',
}

/**
 * Tira, do que a equipe colou no painel, o endereço que o player entende.
 *
 * O SoundCloud entrega a mesma playlist de três jeitos, e os três valem:
 *   - o código de "Incorporar" inteiro (`<iframe … src="…">`);
 *   - o endereço com o número (`api.soundcloud.com/playlists/…`), o mais
 *     seguro: não muda se o canal renomear a playlist;
 *   - o link da página (`soundcloud.com/canal/sets/nome`), sem o rastreio
 *     (`?utm_source=…`) que o botão de compartilhar do celular põe no fim.
 *
 * Devolve `null` quando não é nada disso.
 */
export function playlistDoSoundCloud(entrada: string): string | null {
  let t = entrada.trim()

  const src = t.match(/src\s*=\s*["']([^"']+)["']/i)
  if (src) t = src[1].replace(/&amp;/g, '&')

  if (/^https:\/\/w\.soundcloud\.com\/player/i.test(t)) {
    try {
      const alvo = new URL(t).searchParams.get('url')
      if (!alvo) return null
      t = alvo
    } catch {
      return null
    }
  }

  if (/^https:\/\/api\.soundcloud\.com\/(playlists|tracks|users)\//i.test(t)) return t.split(/[?#]/)[0]
  if (/^https:\/\/(www\.|m\.)?soundcloud\.com\/[^/]+\/sets\/[^/?#]+/i.test(t)) return t.split(/[?#]/)[0]
  return null
}

/** A página da playlist no SoundCloud, quando o próprio link já é ela. */
export function paginaDoSoundCloud(entrada: string): string {
  const t = entrada.trim()
  return /^https:\/\/(www\.|m\.)?soundcloud\.com\/[^/]+\/sets\//i.test(t) ? t.split(/[?#]/)[0] : ''
}

/**
 * O endereço do player oficial do SoundCloud ("widget"): gratuito, faixas
 * inteiras, sem conta.
 *
 * `visual=false` mostra a lista de faixas em vez da capa grande. A cor pinta o
 * botão de tocar e a barra de progresso sobre o fundo branco do player — por
 * isso um dourado escuro, e não o dourado do app, que some no branco.
 */
export function playerSoundCloud(playlist: string): string {
  const params = new URLSearchParams({
    url: playlist,
    color: '#8a6a12',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  })
  return `https://w.soundcloud.com/player/?${params.toString()}`
}
