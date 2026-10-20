import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Versiculo } from '../lib/tipos'
import './Feed.css'

/**
 * bible-api.com com `translation=almeida` só reconhece os livros pelo nome em
 * português (ex.: "Salmos", não "psalms"). Testar com "psalms", "ecclesiastes",
 * "song of solomon", "zechariah", "acts", "ephesians", "philippians",
 * "1 thessalonians" devolve `{"error":"not found"}`. O endpoint aceita o nome
 * acentuado, então usamos ele direto como parâmetro — sem tabela de tradução.
 */
type Livro = { nome: string; capitulos: number }

const LIVROS_AT: Livro[] = [
  { nome: 'Gênesis', capitulos: 50 },
  { nome: 'Êxodo', capitulos: 40 },
  { nome: 'Levítico', capitulos: 27 },
  { nome: 'Números', capitulos: 36 },
  { nome: 'Deuteronômio', capitulos: 34 },
  { nome: 'Josué', capitulos: 24 },
  { nome: 'Juízes', capitulos: 21 },
  { nome: 'Rute', capitulos: 4 },
  { nome: '1 Samuel', capitulos: 31 },
  { nome: '2 Samuel', capitulos: 24 },
  { nome: '1 Reis', capitulos: 22 },
  { nome: '2 Reis', capitulos: 25 },
  { nome: '1 Crônicas', capitulos: 29 },
  { nome: '2 Crônicas', capitulos: 36 },
  { nome: 'Esdras', capitulos: 10 },
  { nome: 'Neemias', capitulos: 13 },
  { nome: 'Ester', capitulos: 10 },
  { nome: 'Jó', capitulos: 42 },
  { nome: 'Salmos', capitulos: 150 },
  { nome: 'Provérbios', capitulos: 31 },
  { nome: 'Eclesiastes', capitulos: 12 },
  { nome: 'Cânticos', capitulos: 8 },
  { nome: 'Isaías', capitulos: 66 },
  { nome: 'Jeremias', capitulos: 52 },
  { nome: 'Lamentações', capitulos: 5 },
  { nome: 'Ezequiel', capitulos: 48 },
  { nome: 'Daniel', capitulos: 12 },
  { nome: 'Oséias', capitulos: 14 },
  { nome: 'Joel', capitulos: 3 },
  { nome: 'Amós', capitulos: 9 },
  { nome: 'Obadias', capitulos: 1 },
  { nome: 'Jonas', capitulos: 4 },
  { nome: 'Miquéias', capitulos: 7 },
  { nome: 'Naum', capitulos: 3 },
  { nome: 'Habacuque', capitulos: 3 },
  { nome: 'Sofonias', capitulos: 3 },
  { nome: 'Ageu', capitulos: 2 },
  { nome: 'Zacarias', capitulos: 14 },
  { nome: 'Malaquias', capitulos: 4 },
]

const LIVROS_NT: Livro[] = [
  { nome: 'Mateus', capitulos: 28 },
  { nome: 'Marcos', capitulos: 16 },
  { nome: 'Lucas', capitulos: 24 },
  { nome: 'João', capitulos: 21 },
  { nome: 'Atos', capitulos: 28 },
  { nome: 'Romanos', capitulos: 16 },
  { nome: '1 Coríntios', capitulos: 16 },
  { nome: '2 Coríntios', capitulos: 13 },
  { nome: 'Gálatas', capitulos: 6 },
  { nome: 'Efésios', capitulos: 6 },
  { nome: 'Filipenses', capitulos: 4 },
  { nome: 'Colossenses', capitulos: 4 },
  { nome: '1 Tessalonicenses', capitulos: 5 },
  { nome: '2 Tessalonicenses', capitulos: 3 },
  { nome: '1 Timóteo', capitulos: 6 },
  { nome: '2 Timóteo', capitulos: 4 },
  { nome: 'Tito', capitulos: 3 },
  { nome: 'Filemom', capitulos: 1 },
  { nome: 'Hebreus', capitulos: 13 },
  { nome: 'Tiago', capitulos: 5 },
  { nome: '1 Pedro', capitulos: 5 },
  { nome: '2 Pedro', capitulos: 3 },
  { nome: '1 João', capitulos: 5 },
  { nome: '2 João', capitulos: 1 },
  { nome: '3 João', capitulos: 1 },
  { nome: 'Judas', capitulos: 1 },
  { nome: 'Apocalipse', capitulos: 22 },
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
    const url = `https://bible-api.com/${encodeURIComponent(livro.nome)}+${capitulo}?translation=almeida`
    setCarregando(true)
    setErro(null)
    setVersiculos([])
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (data?.error) throw new Error(data.error)
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
          <button type="button" className="feed__voltar" onClick={() => setCapitulo(null)}>
            ← Capítulos
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
          <button type="button" className="feed__voltar" onClick={() => setLivro(null)}>
            ← Livros
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
        <Link to="/" className="feed__voltar">← Voltar</Link>
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
