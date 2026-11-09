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
  let t = String(entrada ?? '').trim()
  if (!t) return null

  const src = t.match(/src\s*=\s*["']([^"']+)["']/i)
  if (src) t = src[1].replace(/&amp;/g, '&')

  // Também valem, porque é o que o celular entrega: o endereço sem
  // "https://", o link curto do botão de compartilhar (on.soundcloud.com/…),
  // a página de uma faixa ou do canal, e a playlist privada — cujo
  // `secret_token` precisa ficar no endereço, senão o player diz que ela não
  // existe. Antes, só a página de uma playlist (`/sets/`) tocava.
  if (/^(www\.|m\.|on\.|api\.|w\.)?soundcloud\.com\//i.test(t)) t = `https://${t}`
  t = t.replace(/^http:\/\//i, 'https://')

  if (/^https:\/\/w\.soundcloud\.com\/player/i.test(t)) {
    try {
      const alvo = new URL(t).searchParams.get('url')
      if (!alvo) return null
      t = alvo.trim().replace(/^http:\/\//i, 'https://')
    } catch {
      return null
    }
  }

  if (/^https:\/\/api\.soundcloud\.com\/(playlists|tracks|users)\//i.test(t)) return semRastreio(t)
  if (/^https:\/\/on\.soundcloud\.com\/[^/?#]+/i.test(t)) return semRastreio(t)
  if (/^https:\/\/(www\.|m\.)?soundcloud\.com\/[^/?#]+/i.test(t)) {
    return semRastreio(t).replace(/^https:\/\/(www\.|m\.)/i, 'https://')
  }
  return null
}

/**
 * O endereço sem o rastreio que o botão de compartilhar põe no fim
 * (`?utm_source=…`), mas com o `secret_token` de playlist privada.
 */
function semRastreio(endereco: string): string {
  try {
    const u = new URL(endereco)
    const segredo = u.searchParams.get('secret_token')
    const caminho = u.pathname.replace(/\/+$/, '')
    return `${u.origin}${caminho}${segredo ? `?secret_token=${encodeURIComponent(segredo)}` : ''}`
  } catch {
    return endereco.split(/[?#]/)[0]
  }
}

/** A página da playlist no SoundCloud, quando o próprio link já é ela. */
export function paginaDoSoundCloud(entrada: string): string {
  const t = playlistDoSoundCloud(entrada)
  return t && /^https:\/\/(on\.)?soundcloud\.com\//i.test(t) ? t : ''
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
