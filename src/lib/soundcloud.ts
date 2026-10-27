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
 * Antes existia uma PLAYLIST_PADRAO hardcoded aqui (canal `baixarmusicagospel`
 * no SoundCloud). O canal foi deletado em algum momento, o widget passou a
 * acusar "playlist não encontrada", e a tela de Louvores quebrou para todo
 * mundo que não tinha nada cadastrado no painel.
 *
 * A lição: qualquer URL pública de terceiro pode sumir sem aviso. Em vez de
 * procurar outra playlist e esperar que ela viva para sempre, o app agora
 * assume que **toda playlist que toca saiu do painel admin** (/admin/louvores).
 * Se o painel está vazio, o player simplesmente não aparece e a tela de
 * Louvores explica isso ao fiel (e dá o atalho se for super_admin).
 */

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
