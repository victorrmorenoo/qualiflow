
import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import RegistrationModal from './components/RegistrationModal'
import {
  fazerLogin,
  buscarUsuarioLogado,
  fazerLogout,
  cadastrarUsuario
} from './services/api'

function App() {
  const [logado, setLogado] = useState(false)
  const [perfil, setPerfil] = useState('Gestor')
  const [modalAberto, setModalAberto] = useState(false)

  async function entrar(dados) {
    try {
      await fazerLogin(dados)
      const usuario = await buscarUsuarioLogado()

      setPerfil(usuario.cargo === 'GESTOR' ? 'Gestor' : 'Funcionário')
      setLogado(true)
    } catch (erro) {
      alert(erro.message)
    }
  }

  async function sair() {
    try {
      await fazerLogout()
      setLogado(false)
      setModalAberto(false)
    } catch (erro) {
      alert(erro.message)
    }
  }

  async function cadastrarFuncionario(dados) {
    const usuario = await cadastrarUsuario(dados)

    alert(`Usuário ${usuario.nome} cadastrado!`)
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
