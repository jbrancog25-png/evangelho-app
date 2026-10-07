export type IgrejaSeguida = {
  id: string
  nome: string
  cidade: string
  pastor: string
  /** Breve palavra do pastor para o feed do fiel. */
  palavra: string
  proximoCulto: {
    diaSemana: string
    hora: string
    local: string
  }
  pedidosOracao: number
  /** Chamada do CTA de dízimo/doação. */
  dizimoCta: string
}

export const igrejasSeguidas: IgrejaSeguida[] = [
  {
    id: 'vida-em-cristo-sp',
    nome: 'Vida em Cristo — Sé',
    cidade: 'São Paulo, SP',
    pastor: 'Pr. Marcos Andrade',
    palavra:
      'Alegrai-vos sempre no Senhor. Esta semana meditemos em Filipenses 4:4-7 e levemos a paz à nossa família.',
    proximoCulto: {
      diaSemana: 'Domingo',
      hora: '18h30',
      local: 'Templo Central — Rua da Sé, 120',
    },
    pedidosOracao: 7,
    dizimoCta: 'Entregar o dízimo deste mês',
  },
  {
    id: 'vida-em-cristo-campinas',
    nome: 'Vida em Cristo — Campinas',
    cidade: 'Campinas, SP',
    pastor: 'Pr. Roberto Lima',
    palavra:
      'Deus é refúgio e fortaleza. Na quinta teremos vigília pela cidade — venha interceder conosco.',
    proximoCulto: {
      diaSemana: 'Quinta',
      hora: '20h00',
      local: 'Rua das Flores, 45',
    },
    pedidosOracao: 3,
    dizimoCta: 'Semear a oferta de hoje',
  },
]
