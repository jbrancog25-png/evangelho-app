/**
 * O texto da Bíblia, pelo bible-api.com (Almeida), com três defesas:
 *
 *   1. **Guarda no aparelho** cada capítulo lido. Abrir de novo não pede nada
 *      à rede — e o serviço tem limite de pedidos.
 *   2. **Tenta de novo sozinho**, com pausa, quando o serviço pede calma
 *      (HTTP 429: o limite é de ~15 pedidos a cada 30 s por rede — numa
 *      reunião, com todo mundo no mesmo Wi-Fi, estoura rápido) ou quando a
 *      conexão falha.
 *   3. **Pede de mais de um jeito**: pelo nome em português e, se não der,
 *      pelo código do livro (padrão USFM: GEN, EXO, PSA…), que o serviço
 *      reconhece em qualquer idioma — ver a lista de livros do `bible_ref`,
 *      a biblioteca que o bible-api.com usa para ler as referências.
 */

/** O código de cada livro (padrão USFM), pelo nome que a tela mostra. */
const CODIGOS: Record<string, string> = {
  'Gênesis': 'GEN', 'Êxodo': 'EXO', 'Levítico': 'LEV', 'Números': 'NUM', 'Deuteronômio': 'DEU',
  'Josué': 'JOS', 'Juízes': 'JDG', 'Rute': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Reis': '1KI', '2 Reis': '2KI', '1 Crônicas': '1CH', '2 Crônicas': '2CH', 'Esdras': 'EZR',
  'Neemias': 'NEH', 'Ester': 'EST', 'Jó': 'JOB', 'Salmos': 'PSA', 'Provérbios': 'PRO',
  'Eclesiastes': 'ECC', 'Cânticos': 'SNG', 'Isaías': 'ISA', 'Jeremias': 'JER', 'Lamentações': 'LAM',
  'Ezequiel': 'EZK', 'Daniel': 'DAN', 'Oséias': 'HOS', 'Joel': 'JOL', 'Amós': 'AMO',
  'Obadias': 'OBA', 'Jonas': 'JON', 'Miquéias': 'MIC', 'Naum': 'NAM', 'Habacuque': 'HAB',
  'Sofonias': 'ZEP', 'Ageu': 'HAG', 'Zacarias': 'ZEC', 'Malaquias': 'MAL',
  'Mateus': 'MAT', 'Marcos': 'MRK', 'Lucas': 'LUK', 'João': 'JHN', 'Atos': 'ACT',
  'Romanos': 'ROM', '1 Coríntios': '1CO', '2 Coríntios': '2CO', 'Gálatas': 'GAL', 'Efésios': 'EPH',
  'Filipenses': 'PHP', 'Colossenses': 'COL', '1 Tessalonicenses': '1TH', '2 Tessalonicenses': '2TH',
  '1 Timóteo': '1TI', '2 Timóteo': '2TI', 'Tito': 'TIT', 'Filemom': 'PHM', 'Hebreus': 'HEB',
  'Tiago': 'JAS', '1 Pedro': '1PE', '2 Pedro': '2PE', '1 João': '1JN', '2 João': '2JN',
  '3 João': '3JN', 'Judas': 'JUD', 'Apocalipse': 'REV',
}

export type VersiculoApi = { verse: number; text: string }

const PREFIXO = 'evangelho:biblia:almeida:'
/** Pausas antes de cada rodada de tentativas. */
const ESPERAS_MS = [0, 2_500, 6_000]

function lerGuardado(chave: string): VersiculoApi[] | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave)
    const lista = bruto ? (JSON.parse(bruto) as VersiculoApi[]) : null
    return Array.isArray(lista) && lista.length ? lista : null
  } catch {
    return null
  }
}

function guardar(chave: string, versos: VersiculoApi[]) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(versos))
  } catch {
    // Aparelho sem espaço ou navegação privada: segue sem guardar.
  }
}

function dormir(ms: number, sinal: AbortSignal): Promise<void> {
  return new Promise((ok, falha) => {
    const relogio = setTimeout(ok, ms)
    sinal.addEventListener(
      'abort',
      () => {
        clearTimeout(relogio)
        falha(new DOMException('cancelado', 'AbortError'))
      },
      { once: true },
    )
  })
}

export async function buscarCapitulo(nome: string, capitulo: number, sinal: AbortSignal): Promise<VersiculoApi[]> {
  const codigo = CODIGOS[nome]
  const chave = `${codigo ?? nome}:${capitulo}`
  const guardado = lerGuardado(chave)
  if (guardado) return guardado

  const enderecos = [
    `https://bible-api.com/${encodeURIComponent(nome)}+${capitulo}?translation=almeida`,
    ...(codigo
      ? [
          `https://bible-api.com/${codigo}+${capitulo}?translation=almeida`,
          `https://bible-api.com/data/almeida/${codigo}/${capitulo}`,
        ]
      : []),
  ]

  let ultimo = new Error('sem resposta do serviço da Bíblia')
  for (const espera of ESPERAS_MS) {
    if (espera) await dormir(espera, sinal)
    for (const url of enderecos) {
      let r: Response
      try {
        r = await fetch(url, { signal: sinal })
      } catch (e) {
        if (sinal.aborted) throw e
        ultimo = new Error('sem conexão com o serviço da Bíblia')
        break
      }
      if (r.status === 429) {
        ultimo = new Error('o serviço da Bíblia pediu uma pausa (muitos acessos ao mesmo tempo)')
        break
      }
      if (!r.ok) {
        ultimo = new Error(`o serviço da Bíblia respondeu ${r.status}`)
        continue
      }
      const dados = (await r.json().catch(() => null)) as { error?: unknown; verses?: unknown } | null
      const versos = (Array.isArray(dados?.verses) ? (dados.verses as Partial<VersiculoApi>[]) : [])
        .filter((v) => v && typeof v.text === 'string' && Number.isFinite(Number(v.verse)))
        .map((v) => ({ verse: Number(v.verse), text: String(v.text) }))
      if (versos.length) {
        guardar(chave, versos)
        return versos
      }
      ultimo = new Error(dados?.error ? String(dados.error) : 'capítulo vazio')
    }
  }
  throw ultimo
}
