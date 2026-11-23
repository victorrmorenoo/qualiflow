
function Login({ onEntrar }) {
  function entrar(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    const dados = {
      email: formData.get('email'),
      senha: formData.get('password'),
    }

    onEntrar(dados)
  }

  return (
    <section className="login">
      <aside>
        <div className="login-brand">
          <div className="brand">
            <svg viewBox="0 0 48 48" fill="none" strokeLinecap="round">
              <path d="M27 41A18 18 0 1 1 40 27" stroke="#9b5cff" strokeWidth="6" />
              <path d="M15 25c9-7 13 16 30 17" stroke="#7567ff" strokeWidth="6" />
              <path d="M26 21c7-3 12 2 18 6" stroke="#c084fc" strokeWidth="4" />
            </svg>
            Qualiflow
          </div>
        </div>

        <h1>
          Qualidade na
          <br />
          linha de produção
        </h1>

        <p>
          Controle de qualidade e acompanhamento das inspeções de garrafas PET de 2 litros.
        </p>

        <svg className="art" viewBox="0 0 390 170">
          <rect width="390" height="170" rx="18" fill="#17152c" />
          <path d="M25 135H365M25 95H365M25 55H365" stroke="#30294f" />
          <path
            d="M28 120L78 91 125 105 175 66 225 83 275 51 360 30V145H28Z"
            fill="#9b5cff"
            opacity=".25"
          />
          <path
            d="M28 120L78 91 125 105 175 66 225 83 275 51 360 30"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="4"
          />
        </svg>
      </aside>

      <div className="entry">
        <div className="login-content">

          <h2>Bem-vindo ao Qualiflow</h2>

          <p className="muted">
            Entre com os dados da sua conta para acessar o painel.
          </p>

          <form className="auth-form" onSubmit={entrar}>
            <label htmlFor="loginEmail">E-mail</label>

            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              autoComplete="username"
              required
            />

            <label htmlFor="loginPassword">Senha</label>

            <input
              id="loginPassword"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />

            <button className="primary" type="submit">
              Entrar
            </button>
          </form>

          <div className="solicitar-acesso">
            <p>Não tem acesso ao sistema?</p>

            <a
              href="https://wa.me/5511981090128?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20meu%20acesso%20ao%20sistema%20Qualiflow."
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicite seu cadastro ao gestor
            </a>
          </div>

          <p className="login-footer">
            Qualiflow · Controle de qualidade
          </p>

        </div>
      </div>
    </section>
  )
}

export default Login
