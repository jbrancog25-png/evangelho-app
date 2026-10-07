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
}

export const atalhosExplorar: AtalhoExplorar[] = [
  { id: 'cultos', rotulo: 'Cultos', Icone: CultosIcon, grupo: 'igreja' },
  { id: 'biblia', rotulo: 'Bíblia', Icone: BibliaIcon, grupo: 'igreja' },
  { id: 'louvores', rotulo: 'Louvores', Icone: LouvoresIcon, grupo: 'igreja' },
  { id: 'dizimo', rotulo: 'Dízimo e ofertas', Icone: DizimoIcon, grupo: 'igreja' },
  { id: 'desapego', rotulo: 'Desapego', Icone: DesapegoIcon, grupo: 'igreja' },
  { id: 'missoes', rotulo: 'Missões', Icone: MissoesIcon, grupo: 'igreja' },

  { id: 'eventos', rotulo: 'Eventos', Icone: EventosIcon, grupo: 'fieis' },
  { id: 'esportes', rotulo: 'Esportes', Icone: EsportesIcon, grupo: 'fieis' },
  { id: 'shows', rotulo: 'Shows', Icone: ShowsIcon, grupo: 'fieis' },
  { id: 'cultura', rotulo: 'Cultura', Icone: CulturaIcon, grupo: 'fieis' },
  { id: 'educacao', rotulo: 'Educação', Icone: EducacaoIcon, grupo: 'fieis' },
  { id: 'cursos', rotulo: 'Cursos', Icone: CursosIcon, grupo: 'fieis' },
  { id: 'saude', rotulo: 'Saúde', Icone: SaudeIcon, grupo: 'fieis' },
  { id: 'sangue', rotulo: 'Sangue', Icone: SangueIcon, grupo: 'fieis' },
  { id: 'cestas-basicas', rotulo: 'Cestas básicas', Icone: CestasIcon, grupo: 'fieis' },
  { id: 'beneficios', rotulo: 'Clube de benefícios', Icone: BeneficiosIcon, grupo: 'fieis' },
  { id: 'parceiros', rotulo: 'Entidades parceiras', Icone: ParceirosIcon, grupo: 'fieis' },
  { id: 'vagas', rotulo: 'Vagas de emprego', Icone: VagasIcon, grupo: 'fieis' },
  { id: 'ingles', rotulo: 'Inglês', Icone: InglesIcon, grupo: 'fieis' },
  { id: 'carteira', rotulo: 'Carteira', Icone: CarteiraIcon, grupo: 'fieis' },
  { id: 'ranking', rotulo: 'Ranking', Icone: RankingIcon, grupo: 'fieis' },
  { id: 'perfil', rotulo: 'Perfil', Icone: PerfilIcon, grupo: 'fieis' },
]
