import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, CompartilharIcon, LouvoresIcon, PhotoIcon } from '../components/Icons'
import { atalhosExplorar, usuario, versiculoDia as versiculoFallback, campanhas as campanhasFallback } from '../data/home'
import type { AtalhoExplorar, AtalhoGrupo, Campanha as CampanhaMock } from '../data/home'
import type { IgrejaSeguida } from '../data/igrejas'
import IgrejasSeguidas from '../components/IgrejasSeguidas'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { DIAS_SEMANA, type Campanha as CampanhaDb, type Versiculo } from '../lib/tipos'
import './HomeScreen.css'

/** Acima de 9.999 usa separador de milhar; abaixo disso fica como no painel: "1240 pontos". */
const formatarPontos = (valor: number) =>
  valor > 9999 ? new Intl.NumberFormat('pt-BR').format(valor) : String(valor)

const gruposExplorar: Array<{ grupo: AtalhoGrupo; titulo: string }> = [
  { grupo: 'igreja', titulo: 'Da sua igreja' },
  { grupo: 'fieis', titulo: 'Para todos os fiéis' },
]

type CampanhaExibida = Pick<CampanhaMock, 'id' | 'titulo' | 'descricao' | 'cor' | 'imagem'>

const hoje = () => new Date().toISOString().slice(0, 10)

export default function HomeScreen() {
  const { session, profile, signOut } = useAuth()
  const logado = !!session
  const nomeExibir = profile?.nome ?? 'Visitante'
  const inicial = (profile?.nome ?? 'V').charAt(0).toUpperCase()

  const [versiculo, setVersiculo] = useState<{ texto: string; referencia: string }>(versiculoFallback)
  const [campanhasExib, setCampanhasExib] = useState<CampanhaExibida[]>(campanhasFallback)
  const [igrejasReais, setIgrejasReais] = useState<IgrejaSeguida[]>([])

  useEffect(() => {
    if (!logado) return
    supabase
      .from('versiculos')
      .select('texto, referencia')
      .eq('do_dia_em', hoje())
      .maybeSingle()
      .then(({ data }: { data: Pick<Versiculo, 'texto' | 'referencia'> | null }) => {
        if (data) setVersiculo({ texto: data.texto, referencia: data.referencia })
      })

    supabase
      .from('campanhas')
      .select('id, titulo, descricao, cor, imagem_url')
      .eq('publicada', true)
      .order('criada_em', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCampanhasExib(
            data.map((c: Pick<CampanhaDb, 'id' | 'titulo' | 'descricao' | 'cor' | 'imagem_url'>) => ({
              id: c.id,
              titulo: c.titulo,
              descricao: c.descricao ?? '',
              cor: (c.cor === 'dourado' ? 'ambar' : c.cor) as CampanhaMock['cor'],
              imagem: c.imagem_url ?? undefined,
            })),
          )
        }
      })

    if (profile) {
      carregarIgrejasSeguidas(profile.id).then(setIgrejasReais)
    }
  }, [logado, profile])

  return (
    <div className="home">
      {/* Como no Evangelho antigo: o logo "cortado" — o globo com a pomba e,
          ao lado, o nome (IGREJA MUNDIAL / VIDA EM CRISTO) na letra do logo.
          Na margem direita, o crédito do CONEX. */}
      <header className="home__marca">
        <div className="home__marca-logo" role="img" aria-label="Igreja Mundial Vida em Cristo">
          <img className="home__marca-globo" src="/assets/marca-globo.webp" alt="" width={240} height={192} />
          <img className="home__marca-nome" src="/assets/marca-nome.webp" alt="" width={420} height={160} />
        </div>
        <div className="home__marca-credito">
          <img src="/assets/icon-192.png" alt="" width={24} height={24} />
          <span>Projeto Conex</span>
        </div>
      </header>

      <section className="home__saudacao" aria-label="Sua conta">
        <span className="home__avatar" aria-hidden="true">
          {logado ? inicial : '?'}
        </span>
        <div className="home__saudacao-texto">
          <p className="home__saudacao-linha">A paz do Senhor!</p>
          <p className="home__saudacao-nome">{nomeExibir}</p>
        </div>
        {logado ? (
          <button type="button" onClick={signOut} className="home__avisos">
            Sair
          </button>
        ) : (
          <Link to="/entrar" className="home__avisos">
            Entrar
          </Link>
        )}
      </section>

      {profile?.role === 'super_admin' && (
        <Link to="/admin" className="card card--acesso-admin">
          <span className="acesso-admin__titulo">Painel de administração</span>
          <ChevronRightIcon className="acesso-admin__seta" />
        </Link>
      )}
      {profile?.role === 'pastor' && (
        <Link to="/pastor" className="card card--acesso-admin">
          <span className="acesso-admin__titulo">Minhas igrejas</span>
          <ChevronRightIcon className="acesso-admin__seta" />
        </Link>
      )}

      <Link to="/carteira" className="card card--saldo" aria-label="Seu saldo">
        <div className="saldo__info">
          <p className="saldo__rotulo">Seu saldo</p>
          <p className="saldo__valor">
            {formatarPontos(profile?.pontos ?? usuario.saldoPontos)} pontos
          </p>
        </div>
        <span className="botao botao--primario">Carteira</span>
      </Link>

      <section className="card versiculo" aria-labelledby="titulo-versiculo">
        <div className="versiculo__topo">
          <span id="titulo-versiculo" className="versiculo__rotulo">
            Versículo do dia
          </span>
          <button type="button" className="botao botao--ghost botao--compacto">
            <CompartilharIcon className="botao__icone" /> Compartilhar
          </button>
        </div>
        <p className="versiculo__texto">“{versiculo.texto}”</p>
        <p className="versiculo__referencia">{versiculo.referencia}</p>
      </section>

      <button type="button" className="card card--louvores">
        <span className="louvores__icone">
          <LouvoresIcon />
        </span>
        <span className="louvores__texto">
          <span className="louvores__titulo">Ouvir louvores</span>
          <span className="louvores__subtitulo">
            Música gospel grátis, enquanto você usa o app
          </span>
        </span>
        <ChevronRightIcon className="louvores__seta" />
      </button>

      <IgrejasSeguidas igrejas={logado ? igrejasReais : []} />

      <section className="home__secao" aria-labelledby="titulo-campanhas">
        <h2 id="titulo-campanhas" className="home__secao-titulo">
          Campanhas em destaque
        </h2>
        <ul className="campanhas">
          {campanhasExib.map((campanha) => (
            <li key={campanha.id} className="campanha">
              <div className="campanha__midia">
                {campanha.imagem ? (
                  <img className="campanha__foto" src={campanha.imagem} alt="" />
                ) : (
                  <span className="campanha__placeholder">
                    <PhotoIcon className="campanha__placeholder-icone" />
                    Foto
                  </span>
                )}
              </div>
              <h3 className={`campanha__titulo campanha__titulo--${campanha.cor}`}>
                {campanha.titulo}
              </h3>
              <p className="campanha__descricao">{campanha.descricao}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home__secao home__secao--explorar" aria-labelledby="titulo-explorar">
        <h2 id="titulo-explorar" className="home__secao-titulo">
          Explorar
        </h2>

        {gruposExplorar.map(({ grupo, titulo }) => (
          <GrupoExplorar
            key={grupo}
            titulo={titulo}
            itens={atalhosExplorar.filter((a) => a.grupo === grupo)}
          />
        ))}
      </section>
    </div>
  )
}

async function carregarIgrejasSeguidas(fielId: string): Promise<IgrejaSeguida[]> {
  const { data: segues } = await supabase
    .from('fiel_segue')
    .select('igreja_id')
    .eq('fiel_id', fielId)

  const ids = (segues ?? []).map((s) => s.igreja_id)
  if (ids.length === 0) return []

  const { data: igrejas } = await supabase
    .from('igrejas')
    .select('*')
    .in('id', ids)
    .eq('status', 'aprovada')

  if (!igrejas || igrejas.length === 0) return []

  const enriquecidas = await Promise.all(
    igrejas.map(async (ig) => {
      const [palavraRes, cultoRes, pedidosRes, vinculoRes] = await Promise.all([
        supabase.from('palavras').select('texto').eq('igreja_id', ig.id).eq('publicada', true)
          .order('criada_em', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('cultos').select('dia_semana, hora, local').eq('igreja_id', ig.id).eq('ativo', true)
          .order('dia_semana').limit(1).maybeSingle(),
        supabase.from('pedidos_oracao').select('id', { count: 'exact', head: true })
          .eq('igreja_id', ig.id).eq('publicado', true).eq('arquivado', false),
        supabase.from('pastor_igrejas').select('pastor_id').eq('igreja_id', ig.id).limit(1).maybeSingle(),
      ])

      let nomePastor = 'Pastor responsável'
      if (vinculoRes.data?.pastor_id) {
        const { data: perfilPastor } = await supabase
          .from('profiles').select('nome').eq('id', vinculoRes.data.pastor_id).maybeSingle()
        if (perfilPastor?.nome) nomePastor = `Pr. ${perfilPastor.nome}`
      }

      return {
        id: ig.id,
        nome: ig.nome,
        cidade: `${ig.cidade}, ${ig.estado ?? 'SP'}`,
        pastor: nomePastor,
        palavra: palavraRes.data?.texto ?? 'Em breve a palavra desta semana.',
        proximoCulto: cultoRes.data
          ? {
              diaSemana: DIAS_SEMANA[cultoRes.data.dia_semana],
              hora: cultoRes.data.hora.slice(0, 5),
              local: cultoRes.data.local ?? 'Templo',
            }
          : { diaSemana: 'A definir', hora: '—', local: 'Em breve' },
        pedidosOracao: pedidosRes.count ?? 0,
        dizimoCta: 'Entregar o dízimo',
      }
    }),
  )

  return enriquecidas
}

function GrupoExplorar({ titulo, itens }: { titulo: string; itens: AtalhoExplorar[] }) {
  if (itens.length === 0) return null
  return (
    <div className="explorar-grupo">
      <h3 className="explorar-grupo__titulo">{titulo}</h3>
      <ul className="explorar">
        {itens.map(({ id, rotulo, Icone, rota }) => (
          <li key={id} className="explorar__item">
            <Link to={rota} className="pilula">
              <span className="pilula__icone">
                <Icone />
              </span>
              <span className="pilula__rotulo">{rotulo}</span>
              <ChevronRightIcon className="pilula__seta" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
