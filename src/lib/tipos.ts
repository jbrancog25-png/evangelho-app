export type UserRole = 'super_admin' | 'pastor' | 'fiel'
export type IgrejaStatus = 'pendente' | 'aprovada' | 'rejeitada'

export type Profile = {
  id: string
  email: string
  nome: string
  role: UserRole
  criado_em: string
}

export type Igreja = {
  id: string
  nome: string
  cidade: string
  estado: string
  endereco: string | null
  foto_url: string | null
  status: IgrejaStatus
  motivo_rejeicao: string | null
  criada_por: string
  criada_em: string
  aprovada_em: string | null
  aprovada_por: string | null
}

export type Palavra = {
  id: string
  igreja_id: string
  autor_id: string
  texto: string
  publicada: boolean
  criada_em: string
}

export type Culto = {
  id: string
  igreja_id: string
  dia_semana: number
  hora: string
  local: string | null
  recorrencia: 'semanal' | 'quinzenal' | 'mensal' | 'avulso'
  observacao: string | null
  ativo: boolean
  criado_em: string
}

export type PedidoOracao = {
  id: string
  igreja_id: string
  autor_id: string | null
  autor_nome: string | null
  texto: string
  anonimo: boolean
  publicado: boolean
  arquivado: boolean
  criado_em: string
}

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const

export type EscopoConteudo = 'geral' | 'igreja'

export type EventoCategoria =
  | 'cultural' | 'esportivo' | 'educativo' | 'solidario'
  | 'saude' | 'missao' | 'show' | 'curso' | 'outros'

export type Evento = {
  id: string
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string | null
  local: string | null
  cidade: string | null
  estado: string | null
  categoria: EventoCategoria
  imagem_url: string | null
  link: string | null
  escopo: EscopoConteudo
  igreja_id: string | null
  publicado: boolean
  criado_por: string
  criado_em: string
}

export type Campanha = {
  id: string
  titulo: string
  descricao: string | null
  imagem_url: string | null
  cor: 'azul' | 'verde' | 'ambar' | 'dourado'
  call_to_action: string | null
  link: string | null
  escopo: EscopoConteudo
  igreja_id: string | null
  ativa_de: string
  ativa_ate: string | null
  publicada: boolean
  criada_por: string
  criada_em: string
}

export type VagaTipo = 'clt' | 'pj' | 'estagio' | 'temporaria' | 'voluntariado'

export type Vaga = {
  id: string
  titulo: string
  empresa: string
  descricao: string | null
  cidade: string | null
  estado: string | null
  tipo: VagaTipo
  salario: string | null
  link_candidatura: string | null
  publicada: boolean
  criado_por: string
  criado_em: string
}

export type Versiculo = {
  id: string
  texto: string
  referencia: string
  do_dia_em: string | null
  criado_por: string
  criado_em: string
}

export type CursoNivel = 'basico' | 'intermediario' | 'avancado' | 'livre'

export type Curso = {
  id: string
  titulo: string
  instituicao: string | null
  descricao: string | null
  categoria: string | null
  nivel: CursoNivel
  duracao: string | null
  modalidade: string | null
  link: string | null
  imagem_url: string | null
  gratuito: boolean
  publicado: boolean
  criado_por: string
  criado_em: string
}

export type ParceiroTipo = 'igreja' | 'ong' | 'comercio' | 'escola' | 'publico' | 'outro'

export type Parceiro = {
  id: string
  nome: string
  descricao: string | null
  tipo: ParceiroTipo
  logo_url: string | null
  link: string | null
  cidade: string | null
  estado: string | null
  publicado: boolean
  criado_por: string
  criado_em: string
}

export type Cesta = {
  id: string
  titulo: string
  descricao: string | null
  imagem_url: string | null
  quantidade_disponivel: number
  custo_pontos: number
  local_retirada: string | null
  cidade: string | null
  publicado: boolean
  criado_por: string
  criado_em: string
}

export type Beneficio = {
  id: string
  parceiro_nome: string
  titulo: string
  descricao: string | null
  codigo_cupom: string | null
  link: string | null
  categoria: string | null
  desconto_percentual: number | null
  imagem_url: string | null
  valido_ate: string | null
  publicado: boolean
  criado_por: string
  criado_em: string
}
