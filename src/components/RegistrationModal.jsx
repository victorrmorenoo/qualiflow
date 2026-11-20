function RegistrationModal({ isOpen, onClose, onRegister }) {
  if (!isOpen) {
    return null
  }

  function cadastrar(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    const funcionario = {
      nome: formData.get('nome'),
      email: formData.get('email'),
    }

    onRegister(funcionario)

    event.target.reset()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Cadastrar funcionário</h2>

        <form onSubmit={cadastrar}>
          <label htmlFor="nome">
            Nome completo
          </label>

          <input
            type="text"
            id="nome"
            name="nome"
            placeholder="Digite o nome"
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