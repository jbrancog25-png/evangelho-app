/**
 * Telemedicina da aba Saúde — portado do CONEX.
 *
 * Quem atende é a MEDIX+, parceira. O conteúdo (planos, especialidades, passos,
 * texto da validade jurídica) são dados do projeto, iguais aos do CONEX.
 *
 * O endereço do atendimento vem do env `VITE_TELEMEDICINA_URL`. Se vazio ou
 * inválido, cai no `PADRAO` (que hoje é a porta do CONEX — enquanto o Evangelho
 * não tiver uma porta própria com a MEDIX+, usa a mesma; quando tiver, troca
 * a env var no Vercel).
 */

const PADRAO = 'https://conex.medixmais.com.br/'

const configurada = (import.meta.env.VITE_TELEMEDICINA_URL as string | undefined)?.trim()
const url = configurada && /^https?:\/\//.test(configurada) ? configurada : PADRAO

/** Deriva o host base da URL atual, para montar os links de checkout. */
const baseCheckout = (() => {
  try {
    const u = new URL(url)
    return `${u.origin}/checkout`
  } catch {
    return 'https://conex.medixmais.com.br/checkout'
  }
})()

export const telemedicina = {
  parceiro: 'MEDIX+',
  parceiroId: 'medix-mais',
  cor: '#0FA3A3',

  atendimentoUrl: url,

  /** Planos pagos no site da MEDIX+. UUIDs iguais aos do CONEX. */
  planos: [
    { nome: 'Adesão individual', para: 'Uma pessoa',    preco: 'R$ 69,90',  periodo: 'por mês', id: '7756e7e0-0e79-4c4b-8c49-6b23aa310829' },
    { nome: 'Plano família',     para: 'Até 4 pessoas', preco: 'R$ 222,00', periodo: 'por mês', id: '93c117a4-6cd1-41dd-8310-4590c2768b9f' },
    { nome: 'Plano família',     para: 'Até 6 pessoas', preco: 'R$ 333,00', periodo: 'por mês', id: '97651b10-2dfb-4fc1-8bcd-646f04107da0' },
  ].map((p) => ({ ...p, url: `${baseCheckout}/${p.id}/` })),

  numeros: [
    { valor: '24h',  texto: 'todos os dias do ano' },
    { valor: '+30',  texto: 'especialidades' },
    { valor: '100%', texto: 'pelo celular' },
  ],

  atendimentos: [
    { titulo: 'Clínico geral, pediatra e médico de família',
      texto: 'A qualquer hora, todos os dias — inclusive de madrugada e no fim de semana.' },
    { titulo: 'Psicologia e psiquiatria',
      texto: 'Acolhimento e acompanhamento em saúde mental, por vídeo.' },
    { titulo: 'Nutrição',
      texto: 'Orientação alimentar com profissional, sem precisar sair de casa.' },
    { titulo: 'Mais de 30 especialidades',
      texto: 'Quando o caso pede um especialista, ele entra na mesma plataforma.' },
  ],

  passos: [
    { titulo: 'Abra o atendimento', texto: 'Pelo celular, de onde você estiver.' },
    { titulo: 'Fale por vídeo',     texto: 'Um profissional de saúde atende você na hora.' },
    { titulo: 'Receba os documentos',
      texto: 'Receita, atestado, laudo e encaminhamento chegam digitais, na mesma conversa.' },
  ],

  validade: {
    titulo: 'Receita e atestado valem',
    texto:
      'O atendimento segue a Resolução CFM nº 2.314/2022, que regulamenta a telemedicina no Brasil. Receita, atestado e laudo saem assinados digitalmente e têm o mesmo valor dos de papel — a farmácia aceita, e o trabalho também.',
  },
} as const
