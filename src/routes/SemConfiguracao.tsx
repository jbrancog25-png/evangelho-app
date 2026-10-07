import logo from '../assets/vida-em-cristo.jpg'
import './Autenticacao.css'

export default function SemConfiguracao() {
  return (
    <div className="auth">
      <img className="auth__logo" src={logo} alt="" />
      <h1 className="auth__titulo">Configuração pendente</h1>
      <p className="auth__subtitulo">
        O app ainda não está conectado ao Supabase. Siga o guia abaixo para habilitar login e banco de dados.
      </p>

      <ol className="config__passos">
        <li>Crie um projeto grátis em <strong>supabase.com</strong>.</li>
        <li>
          Dentro do projeto: <em>Settings → API</em>. Copie o <strong>Project URL</strong> e a <strong>anon public key</strong>.
        </li>
        <li>
          Na raiz do app, crie um arquivo <code>.env.local</code> com:
          <pre>VITE_SUPABASE_URL=https://xxxxx.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</pre>
        </li>
        <li>Rode o SQL de <code>supabase/migrations/0001_fundacao.sql</code> no SQL Editor do Supabase.</li>
        <li>Reinicie o <code>npm run dev</code>.</li>
      </ol>

      <p className="auth__rodape">
        Em produção (Vercel): adicione as mesmas variáveis em <em>Settings → Environment Variables</em>.
      </p>
    </div>
  )
}
