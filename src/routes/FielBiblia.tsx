import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Versiculo } from '../lib/tipos'
import './Feed.css'

type Livro = { nome: string; apiNome: string; capitulos: number }

const LIVROS_AT: Livro[] = [
  { nome: 'Gênesis', apiNome: 'genesis', capitulos: 50 },
  { nome: 'Êxodo', apiNome: 'exodus', capitulos: 40 },
  { nome: 'Levítico', apiNome: 'leviticus', capitulos: 27 },
  { nome: 'Números', apiNome: 'numbers', capitulos: 36 },
  { nome: 'Deuteronômio', apiNome: 'deuteronomy', capitulos: 34 },
  { nome: 'Josué', apiNome: 'joshua', capitulos: 24 },
  { nome: 'Juízes', apiNome: 'judges', capitulos: 21 },
  { nome: 'Rute', apiNome: 'ruth', capitulos: 4 },
  { nome: '1 Samuel', apiNome: '1 samuel', capitulos: 31 },
  { nome: '2 Samuel', apiNome: '2 samuel', capitulos: 24 },
  { nome: '1 Reis', apiNome: '1 kings', capitulos: 22 },
  { nome: '2 Reis', apiNome: '2 kings', capitulos: 25 },
  { nome: '1 Crônicas', apiNome: '1 chronicles', capitulos: 29 },
  { nome: '2 Crônicas', apiNome: '2 chronicles', capitulos: 36 },
  { nome: 'Esdras', apiNome: 'ezra', capitulos: 10 },
  { nome: 'Neemias', apiNome: 'nehemiah', capitulos: 13 },
  { nome: 'Ester', apiNome: 'esther', capitulos: 10 },
  { nome: 'Jó', apiNome: 'job', capitulos: 42 },
  { nome: 'Salmos', apiNome: 'psalms', capitulos: 150 },
  { nome: 'Provérbios', apiNome: 'proverbs', capitulos: 31 },
  { nome: 'Eclesiastes', apiNome: 'ecclesiastes', capitulos: 12 },
  { nome: 'Cânticos', apiNome: 'song of solomon', capitulos: 8 },
  { nome: 'Isaías', apiNome: 'isaiah', capitulos: 66 },
  { nome: 'Jeremias', apiNome: 'jeremiah', capitulos: 52 },
  { nome: 'Lamentações', apiNome: 'lamentations', capitulos: 5 },
  { nome: 'Ezequiel', apiNome: 'ezekiel', capitulos: 48 },
  { nome: 'Daniel', apiNome: 'daniel', capitulos: 12 },
  { nome: 'Oséias', apiNome: 'hosea', capitulos: 14 },
  { nome: 'Joel', apiNome: 'joel', capitulos: 3 },
  { nome: 'Amós', apiNome: 'amos', capitulos: 9 },
  { nome: 'Obadias', apiNome: 'obadiah', capitulos: 1 },
  { nome: 'Jonas', apiNome: 'jonah', capitulos: 4 },
  { nome: 'Miquéias', apiNome: 'micah', capitulos: 7 },
  { nome: 'Naum', apiNome: 'nahum', capitulos: 3 },
  { nome: 'Habacuque', apiNome: 'habakkuk', capitulos: 3 },
  { nome: 'Sofonias', apiNome: 'zephaniah', capitulos: 3 },
  { nome: 'Ageu', apiNome: 'haggai', capitulos: 2 },
  { nome: 'Zacarias', apiNome: 'zechariah', capitulos: 14 },
  { nome: 'Malaquias', apiNome: 'malachi', capitulos: 4 },
]

const LIVROS_NT: Livro[] = [
  { nome: 'Mateus', apiNome: 'matthew', capitulos: 28 },
  { nome: 'Marcos', apiNome: 'mark', capitulos: 16 },
  { nome: 'Lucas', apiNome: 'luke', capitulos: 24 },
  { nome: 'João', apiNome: 'john', capitulos: 21 },
  { nome: 'Atos', apiNome: 'acts', capitulos: 28 },
  { nome: 'Romanos', apiNome: 'romans', capitulos: 16 },
  { nome: '1 Coríntios', apiNome: '1 corinthians', capitulos: 16 },
  { nome: '2 Coríntios', apiNome: '2 corinthians', capitulos: 13 },
  { nome: 'Gálatas', apiNome: 'galatians', capitulos: 6 },
  { nome: 'Efésios', apiNome: 'ephesians', capitulos: 6 },
  { nome: 'Filipenses', apiNome: 'philippians', capitulos: 4 },
  { nome: 'Colossenses', apiNome: 'colossians', capitulos: 4 },
  { nome: '1 Tessalonicenses', apiNome: '1 thessalonians', capitulos: 5 },
  { nome: '2 Tessalonicenses', apiNome: '2 thessalonians', capitulos: 3 },
  { nome: '1 Timóteo', apiNome: '1 timothy', capitulos: 6 },
  { nome: '2 Timóteo', apiNome: '2 timothy', capitulos: 4 },
  { nome: 'Tito', apiNome: 'titus', capitulos: 3 },
  { nome: 'Filemom', apiNome: 'philemon', capitulos: 1 },
  { nome: 'Hebreus', apiNome: 'hebrews', capitulos: 13 },
  { nome: 'Tiago', apiNome: 'james', capitulos: 5 },
  { nome: '1 Pedro', apiNome: '1 peter', capitulos: 5 },
  { nome: '2 Pedro', apiNome: '2 peter', capitulos: 3 },
  { nome: '1 João', apiNome: '1 john', capitulos: 5 },
  { nome: '2 João', apiNome: '2 john', capitulos: 1 },
  { nome: '3 João', apiNome: '3 john', capitulos: 1 },
  { nome: 'Judas', apiNome: 'jude', capitulos: 1 },
  { nome: 'Apocalipse', apiNome: 'revelation', capitulos: 22 },
]

type VersiculoApi = { book_name: string; chapter: number; verse: number; text: string }

export default function FielBiblia() {
  const [versiculoDia, setVersiculoDia] = useState<Pick<Versiculo, 'texto' | 'referencia'> | null>(null)
  const [livro, setLivro] = useState<Livro | null>(null)
  const [capitulo, setCapitulo] = useState<number | null>(null)
  const [versiculos, setVersiculos] = useState<VersiculoApi[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Livro e capítulo trocam a tela sem trocar o endereço: volta ao alto também.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [livro, capitulo])

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    supabase
      .from('versiculos')
      .select('texto, referencia')
      .eq('do_dia_em', hoje)
      .maybeSingle()
      .then(({ data }) => setVersiculoDia(data))
  }, [])

  useEffect(() => {
    if (!livro || !capitulo) return
    const url = `https://bible-api.com/${encodeURIComponent(livro.apiNome)}+${capitulo}?translation=almeida`
    setCarregando(true)
    setErro(null)
    setVersiculos([])
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setVersiculos(data.verses ?? [])
      })
      .catch((e) => setErro(`Não foi possível carregar: ${e.message}`))
      .finally(() => setCarregando(false))
  }, [livro, capitulo])

  // -------------------- Visões --------------------

  if (livro && capitulo) {
    return (
      <div className="feed">
        <header className="feed__topo">
          <button type="button" className="feed__voltar" aria-label="Voltar aos capítulos" onClick={() => setCapitulo(null)}>
            ‹
          </button>
          <h1 className="feed__titulo">{livro.nome} {capitulo}</h1>
        </header>

        {carregando && <p className="admin__vazio">Carregando…</p>}
        {erro && <p className="auth__erro">{erro}</p>}

        <div className="biblia__texto">
          {versiculos.map((v) => (
            <p key={v.verse} className="biblia__versiculo">
              <sup className="biblia__num">{v.verse}</sup>{' '}
              {v.text.trim()}
            </p>
          ))}
        </div>

        {capitulo < livro.capitulos && (
          <button
            type="button"
            className="botao botao--primario"
            onClick={() => setCapitulo((c) => (c ?? 0) + 1)}
          >
            Próximo capítulo →
          </button>
        )}
      </div>
    )
  }

  if (livro) {
    return (
      <div className="feed">
        <header className="feed__topo">
          <button type="button" className="feed__voltar" aria-label="Voltar aos livros" onClick={() => setLivro(null)}>
            ‹
          </button>
          <h1 className="feed__titulo">{livro.nome}</h1>
        </header>

        <p className="admin__item-meta">Escolha o capítulo</p>
        <div className="biblia__capitulos">
          {Array.from({ length: livro.capitulos }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className="biblia__capitulo"
              onClick={() => setCapitulo(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar" aria-label="Voltar">‹</Link>
        <h1 className="feed__titulo">Bíblia</h1>
      </header>

      {versiculoDia && (
        <section className="card versiculo">
          <span className="versiculo__rotulo">Versículo do dia</span>
          <p className="versiculo__texto">“{versiculoDia.texto}”</p>
          <p className="versiculo__referencia">{versiculoDia.referencia}</p>
        </section>
      )}

      <h2 className="admin__secao-titulo" style={{ padding: 0 }}>Antigo Testamento</h2>
      <ul className="biblia__livros">
        {LIVROS_AT.map((l) => (
          <li key={l.nome}>
            <button type="button" className="biblia__livro" onClick={() => setLivro(l)}>
              {l.nome}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="admin__secao-titulo" style={{ padding: 0 }}>Novo Testamento</h2>
      <ul className="biblia__livros">
        {LIVROS_NT.map((l) => (
          <li key={l.nome}>
            <button type="button" className="biblia__livro" onClick={() => setLivro(l)}>
              {l.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
