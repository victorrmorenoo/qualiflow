
import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import RegistrationModal from './components/RegistrationModal'

function App() {
  const [logado, setLogado] = useState(false)
  const [perfil, setPerfil] = useState('Gestor')
  const [modalAberto, setModalAberto] = useState(false)

  function entrar(dados) {
    console.log('Dados de login:', dados)

    
    setPerfil('Gestor')
    setLogado(true)
  }

  function sair() {
    setLogado(false)
    setModalAberto(false)
  }

  function cadastrarFuncionario(funcionario) {
    alert(`Funcionário ${funcionario.nome} cadastrado!`)
    setModalAberto(false)
  }

  return (
    <>
      {!logado ? (
        <Login onEntrar={entrar} />
      ) : (
        <>
          <Dashboard
            perfil={perfil}
            onSair={sair}
            onCadastrar={() => setModalAberto(true)}
          />

          <RegistrationModal
            isOpen={modalAberto}
            onClose={() => setModalAberto(false)}
            onRegister={cadastrarFuncionario}
          />
        </>
      )}
    </>
  )
}

export default App
