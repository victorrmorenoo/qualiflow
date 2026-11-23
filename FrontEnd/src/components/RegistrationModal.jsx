function RegistrationModal({ isOpen, onClose, onRegister }) {
  if (!isOpen) {
    return null
  }

  async function cadastrar(event) {
    event.preventDefault()

    const formulario = event.currentTarget
    const formData = new FormData(formulario)

    const usuario = {
      nome: formData.get('nome'),
      sobrenome: formData.get('sobrenome'),
      email: formData.get('email'),
      senha: formData.get('senha'),
      cargo: formData.get('cargo'),
    }

    try {
      await onRegister(usuario)
    } catch (erro) {
      alert(erro.message)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Cadastrar funcionário</h2>

        <form onSubmit={cadastrar}>
          <label htmlFor="nome">
            Nome
          </label>

          <input
            type="text"
            id="nome"
            name="nome"
            placeholder="Digite o nome do funcionário"
            required
          />

          <label htmlFor="sobrenome">
            Sobrenome
          </label>

          <input
            type="text"
            id="sobrenome"
            name="sobrenome"
            placeholder="Digite o sobrenome do funcionário"
            required
          />

          <label htmlFor="email">
            E-mail
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Digite o e-mail"
            required
          />

          <label htmlFor="senha">
            Senha
          </label>

          <input
            type="password"
            id="senha"
            name="senha"
            placeholder="Digite a senha"
            required
          />

          <label htmlFor="cargo">
            Cargo
          </label>

          <select id="cargo" name="cargo" required>
            <option value="">Selecione o cargo</option>
            <option value="GESTOR">Gestor</option>
            <option value="FUNCIONARIO">Funcionário</option>
          </select>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button type="submit">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistrationModal