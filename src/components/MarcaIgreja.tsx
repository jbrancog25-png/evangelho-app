import './MarcaIgreja.css'

type Props = {
  /** `topo`: no alto do Início. `painel`: centrada numa caixa (Entrar, Cadastro). `mini`: só o globo. */
  tamanho?: 'topo' | 'painel' | 'mini'
}

/**
 * O logo da igreja como no Evangelho antigo: "cortado" em duas peças — o globo
 * com a pomba e, ao lado, o nome (IGREJA MUNDIAL / VIDA EM CRISTO) na letra do
 * próprio logo. As imagens vêm do app antigo (scripts/make-evangelho-icons.py
 * no conex-app).
 */
export default function MarcaIgreja({ tamanho = 'topo' }: Props) {
  return (
    <div className={`marca marca--${tamanho}`} role="img" aria-label="Igreja Mundial Vida em Cristo">
      <img className="marca__globo" src="/assets/marca-globo.webp" alt="" width={240} height={192} />
      {tamanho !== 'mini' && (
        <img className="marca__nome" src="/assets/marca-nome.webp" alt="" width={420} height={160} />
      )}
    </div>
  )
}
