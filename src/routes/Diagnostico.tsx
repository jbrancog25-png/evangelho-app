import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { playlistDoSoundCloud } from '../lib/soundcloud'
import { hojeLocal } from '../lib/datas'
import './Feed.css'

/**
 * `/diagnostico`: a qual projeto do Supabase este app fala, e o que encontra
 * lá — tabela por tabela, com a contagem ou o erro. Responde do celular, em um
 * minuto, se o app está ligado ao projeto certo (com dois projetos no
 * Supabase, é fácil a Vercel ficar com o endereço de um e a chave do outro, ou
 * uma migração ter rodado no projeto errado).
 *
 * Só mostra nomes públicos: o código do projeto, que aparece em todo pedido do
 * navegador. Nenhuma chave. Logado, as contagens são as que a conta enxerga.
 */

type Nivel = 'ok' | 'aviso' | 'erro'
type Linha = { nivel: Nivel; titulo: string; detalhe: string }
const MARCA: Record<Nivel, string> = { ok: '✅', aviso: '⚠️', erro: '❌' }

const TABELAS = [
  'profiles', 'igrejas', 'pastor_igrejas', 'fiel_segue', 'cultos', 'palavras', 'pedidos_oracao',
  'versiculos', 'louvores', 'dizimos', 'eventos', 'campanhas', 'vagas', 'cursos', 'parceiros',
  'cestas', 'beneficios', 'campanhas_sangue', 'desapegos', 'consultas_horarios', 'consultas_agendadas',
]

const URL_DO_APP = (import.meta.env.VITE_SUPABASE_URL ?? '') as string
const CHAVE_DO_APP = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string

function projetoDoApp() {
  let projeto: string | null = null
  try {
    projeto = URL_DO_APP ? new URL(URL_DO_APP).hostname.split('.')[0] : null
  } catch {
    projeto = null
  }
  let projetoDaChave: string | null = null
  const partes = CHAVE_DO_APP.split('.')
  if (partes.length === 3) {
    try {
      const corpo = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/'))) as { ref?: unknown }
      projetoDaChave = typeof corpo.ref === 'string' ? corpo.ref : null
    } catch {
      projetoDaChave = null
    }
  }
  const tipo = !CHAVE_DO_APP ? 'nenhuma' : CHAVE_DO_APP.startsWith('sb_publishable_') ? 'publicável (nova)' : partes.length === 3 ? 'anon (antiga)' : 'desconhecida'
  return { projeto, projetoDaChave, tipo }
}

function comPrazo<T>(p: PromiseLike<T>, ms = 12_000): Promise<T> {
  return new Promise<T>((ok, falha) => {
    const relogio = setTimeout(() => falha(new Error(`sem resposta em ${ms / 1000} s`)), ms)
    Promise.resolve(p).then(
      (v) => { clearTimeout(relogio); ok(v) },
      (e: unknown) => { clearTimeout(relogio); falha(e instanceof Error ? e : new Error(String(e))) },
    )
  })
}

async function verificar(anotar: (l: Linha) => void) {
  const passo = async (titulo: string, fn: () => Promise<void>) => {
    try {
      await comPrazo(fn())
    } catch (e) {
      anotar({ nivel: 'erro', titulo, detalhe: e instanceof Error ? e.message : String(e) })
    }
  }

  await passo('Conta', async () => {
    const { data: s } = await supabase.auth.getSession()
    if (!s.session) {
      anotar({ nivel: 'aviso', titulo: 'Conta', detalhe: 'não está logado — entre e abra o diagnóstico de novo (quase tudo exige login)' })
      return
    }
    const { data: u, error } = await supabase.auth.getUser()
    if (error) {
      anotar({ nivel: 'erro', titulo: 'Conta', detalhe: `este projeto recusou a sessão: ${error.message}` })
      return
    }
    const p = await supabase.from('profiles').select('role, nome').eq('id', u.user?.id ?? '').maybeSingle()
    const papel = (p.data as { role?: string } | null)?.role
    anotar({
      nivel: p.error || !papel ? 'erro' : 'ok',
      titulo: 'Conta',
      detalhe: p.error
        ? `logado como ${u.user?.email}, mas o perfil não abriu: ${p.error.message}`
        : papel
          ? `${u.user?.email} · papel: ${papel}`
          : `${u.user?.email} · SEM perfil neste projeto (a conta pode ser do outro projeto)`,
    })
  })

  for (const tabela of TABELAS) {
    await passo(`Tabela ${tabela}`, async () => {
      const r = await supabase.from(tabela).select('*', { count: 'exact', head: true })
      anotar(
        r.error
          ? { nivel: 'erro', titulo: `Tabela ${tabela}`, detalhe: `${r.error.code ?? ''} ${r.error.message}`.trim() }
          : { nivel: 'ok', titulo: `Tabela ${tabela}`, detalhe: `${r.count ?? 0} linha(s) visíveis` },
      )
    })
  }

  await passo('Versículo do dia', async () => {
    const r = await supabase.from('versiculos').select('referencia, do_dia_em').lte('do_dia_em', hojeLocal()).order('do_dia_em', { ascending: false }).limit(1)
    const v = (r.data ?? [])[0] as { referencia: string; do_dia_em: string } | undefined
    anotar(
      r.error
        ? { nivel: 'erro', titulo: 'Versículo do dia', detalhe: r.error.message }
        : v
          ? { nivel: v.do_dia_em === hojeLocal() ? 'ok' : 'aviso', titulo: 'Versículo do dia', detalhe: `${v.referencia} (marcado para ${v.do_dia_em})` }
          : { nivel: 'aviso', titulo: 'Versículo do dia', detalhe: 'nenhum marcado — marque um em Admin → Versículos' },
    )
  })

  await passo('Louvores no player', async () => {
    const r = await supabase.from('louvores').select('titulo, url').eq('publicado', true)
    if (r.error) {
      anotar({ nivel: 'erro', titulo: 'Louvores no player', detalhe: r.error.message })
      return
    }
    const lista = (r.data ?? []) as { titulo: string; url: string }[]
    const tocam = lista.filter((l) => playlistDoSoundCloud(l.url)).length
    anotar({
      nivel: tocam ? 'ok' : 'aviso',
      titulo: 'Louvores no player',
      detalhe: `${lista.length} publicado(s), ${tocam} do SoundCloud (tocam no player)${lista.length && !tocam ? ' — cadastre um link do SoundCloud' : ''}`,
    })
  })

  await passo('Bíblia (bible-api.com)', async () => {
    const r = await fetch('https://bible-api.com/JHN+3?translation=almeida')
    const dados = (await r.json().catch(() => null)) as { verses?: unknown[] } | null
    const n = Array.isArray(dados?.verses) ? dados.verses.length : 0
    anotar(
      r.status === 429
        ? { nivel: 'aviso', titulo: 'Bíblia (bible-api.com)', detalhe: 'o serviço pediu uma pausa (limite de acessos) — o app tenta de novo sozinho' }
        : n
          ? { nivel: 'ok', titulo: 'Bíblia (bible-api.com)', detalhe: `João 3 com ${n} versículos` }
          : { nivel: 'erro', titulo: 'Bíblia (bible-api.com)', detalhe: `resposta ${r.status} sem versículos` },
    )
  })
}

export default function Diagnostico() {
  const app = projetoDoApp()
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [terminou, setTerminou] = useState(false)
  const [rodada, setRodada] = useState(0)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let vivo = true
    setLinhas([])
    setTerminou(false)
    setCopiado(false)
    void verificar((l) => vivo && setLinhas((atual) => [...atual, l])).finally(() => vivo && setTerminou(true))
    return () => {
      vivo = false
    }
  }, [rodada])

  const chaveDeOutro = Boolean(app.projetoDaChave && app.projetoDaChave !== app.projeto)

  const texto = () =>
    [
      `Projeto do Supabase no app: ${app.projeto ?? 'nenhum'} (${URL_DO_APP || 'sem endereço'})`,
      `Chave: ${app.tipo}${chaveDeOutro ? ` — de OUTRO projeto: ${app.projetoDaChave}` : ''}`,
      `Versão do app: ${__VERSAO__}`,
      ...linhas.map((l) => `${MARCA[l.nivel]} ${l.titulo}: ${l.detalhe}`),
    ].join('\n')

  const copiar = () => {
    const t = texto()
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(t).then(() => setCopiado(true), () => window.prompt('Copie o resultado:', t))
    } else {
      window.prompt('Copie o resultado:', t)
    }
  }

  return (
    <div className="feed">
      <header className="feed__topo">
        <Link to="/" className="feed__voltar">← Voltar</Link>
        <h1 className="feed__titulo">Diagnóstico</h1>
      </header>

      <section className="card versiculo">
        <span className="versiculo__rotulo">Projeto do Supabase que este app usa</span>
        <p className="versiculo__texto" style={{ fontSize: 24, fontWeight: 900, wordBreak: 'break-all' }}>{app.projeto ?? 'nenhum'}</p>
        <p className="versiculo__referencia" style={{ wordBreak: 'break-all' }}>{URL_DO_APP || 'sem endereço'}</p>
        <p className="feed__item-meta">Compare com o Supabase: Project Settings → General → Project ID.</p>
        <p className="feed__item-meta">Chave {app.tipo} · versão do app {__VERSAO__}</p>
      </section>

      {chaveDeOutro && (
        <p className="auth__erro">❌ A chave do app é de OUTRO projeto: {app.projetoDaChave}</p>
      )}

      <ul className="feed__lista">
        {linhas.map((l, i) => (
          <li key={i} className="feed__item">
            <div className="feed__item-corpo">
              <h3 className="feed__item-titulo">{MARCA[l.nivel]} {l.titulo}</h3>
              <p className="feed__item-meta" style={{ wordBreak: 'break-word' }}>{l.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>
      {!terminou && <p className="admin__vazio">Verificando…</p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" className="botao botao--primario" onClick={copiar}>
          {copiado ? 'Copiado!' : 'Copiar resultado'}
        </button>
        <button type="button" className="botao" onClick={() => setRodada((n) => n + 1)}>
          Verificar de novo
        </button>
      </div>
    </div>
  )
}
