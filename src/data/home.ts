import type { ComponentType, SVGProps } from 'react'
import {
  BeneficiosIcon,
  BibliaIcon,
  CarteiraIcon,
  CestasIcon,
  CulturaIcon,
  CultosIcon,
  CursosIcon,
  DesapegoIcon,
  DizimoIcon,
  EducacaoIcon,
  EsportesIcon,
  EventosIcon,
  InglesIcon,
  LouvoresIcon,
  MissoesIcon,
  ParceirosIcon,
  PerfilIcon,
  RankingIcon,
  SangueIcon,
  SaudeIcon,
  ShowsIcon,
  VagasIcon,
} from '../components/Icons'

export type Usuario = {
  nome: string
  saudacao: string
  saldoPontos: number
  temAvisosNaoLidos: boolean
}

export const usuario: Usuario = {
  nome: 'A',
  saudacao: 'A paz do Senhor!',
  saldoPontos: 1240,
  temAvisosNaoLidos: true,
}

export type VersiculoDia = {
  texto: string
  referencia: string
}

export const versiculoDia: VersiculoDia = {
  texto: 'Tua palavra é lâmpada para meus pés e luz para meu caminho.',
  referencia: 'Salmos 119:105',
}

export type Campanha = {
  id: string
  titulo: string
  descricao: string
  cor: 'azul' | 'verde' | 'ambar'
  /** Quando ausente, o card mostra o espaço reservado de foto. */
  imagem?: string
}

export const campanhas: Campanha[] = [
  {
    id: 'agasalho',
    titulo: 'Campanha do Agasalho',
    descricao: 'Doe roupas de frio e ganhe pontos em dobro.',
    cor: 'azul',
  },
  {
    id: 'missao-norte',
    titulo: 'Missão Norte do País',
    descricao: 'Participe das ofertas missionárias deste mês.',
    cor: 'verde',
  },
  {
    id: 'cesta-basica',
    titulo: 'Cesta Básica Solidária',
    descricao: 'Monte uma cesta e abençoe uma família.',
    cor: 'ambar',
  },
]

export type AtalhoGrupo = 'igreja' | 'fieis'

export type AtalhoExplorar = {
  id: string
  rotulo: string
  Icone: ComponentType<SVGProps<SVGSVGElement>>
  grupo: AtalhoGrupo
  rota: string
}

export const atalhosExplorar: AtalhoExplorar[] = [
  { id: 'cultos', rotulo: 'Cultos', Icone: CultosIcon, grupo: 'igreja', rota: '/em-breve/cultos' },
  { id: 'biblia', rotulo: 'Bíblia', Icone: BibliaIcon, grupo: 'igreja', rota: '/biblia' },
  { id: 'louvores', rotulo: 'Louvores', Icone: LouvoresIcon, grupo: 'igreja', rota: '/louvores' },
  { id: 'dizimo', rotulo: 'Dízimo e ofertas', Icone: DizimoIcon, grupo: 'igreja', rota: '/em-breve/dizimo' },
  { id: 'desapego', rotulo: 'Desapego', Icone: DesapegoIcon, grupo: 'igreja', rota: '/desapego' },
  { id: 'missoes', rotulo: 'Missões', Icone: MissoesIcon, grupo: 'igreja', rota: '/atividade/missao' },

  { id: 'eventos', rotulo: 'Eventos', Icone: EventosIcon, grupo: 'fieis', rota: '/eventos' },
  { id: 'esportes', rotulo: 'Esportes', Icone: EsportesIcon, grupo: 'fieis', rota: '/atividade/esportivo' },
  { id: 'shows', rotulo: 'Shows', Icone: ShowsIcon, grupo: 'fieis', rota: '/atividade/show' },
  { id: 'cultura', rotulo: 'Cultura', Icone: CulturaIcon, grupo: 'fieis', rota: '/atividade/cultural' },
  { id: 'educacao', rotulo: 'Educação', Icone: EducacaoIcon, grupo: 'fieis', rota: '/atividade/educativo' },
  { id: 'cursos', rotulo: 'Cursos', Icone: CursosIcon, grupo: 'fieis', rota: '/cursos' },
  { id: 'saude', rotulo: 'Saúde', Icone: SaudeIcon, grupo: 'fieis', rota: '/atividade/saude' },
  { id: 'sangue', rotulo: 'Sangue', Icone: SangueIcon, grupo: 'fieis', rota: '/sangue' },
  { id: 'cestas-basicas', rotulo: 'Cestas básicas', Icone: CestasIcon, grupo: 'fieis', rota: '/cestas' },
  { id: 'beneficios', rotulo: 'Clube de benefícios', Icone: BeneficiosIcon, grupo: 'fieis', rota: '/beneficios' },
  { id: 'parceiros', rotulo: 'Entidades parceiras', Icone: ParceirosIcon, grupo: 'fieis', rota: '/parceiros' },
  { id: 'vagas', rotulo: 'Vagas de emprego', Icone: VagasIcon, grupo: 'fieis', rota: '/vagas' },
  { id: 'ingles', rotulo: 'Inglês', Icone: InglesIcon, grupo: 'fieis', rota: '/ingles' },
  { id: 'carteira', rotulo: 'Carteira', Icone: CarteiraIcon, grupo: 'fieis', rota: '/carteira' },
  { id: 'ranking', rotulo: 'Ranking', Icone: RankingIcon, grupo: 'fieis', rota: '/ranking' },
  { id: 'perfil', rotulo: 'Perfil', Icone: PerfilIcon, grupo: 'fieis', rota: '/perfil' },
]
