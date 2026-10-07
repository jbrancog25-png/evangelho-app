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
