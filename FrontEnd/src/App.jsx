
import { useEffect, useState } from 'react'
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
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [erroSessao, setErroSessao] = useState('')

  useEffect(() => {
    let ativo = true

    async function recuperarSessao() {
      try {
        const usuario = await buscarUsuarioLogado()

        if (ativo) {
          setPerfil(usuario.cargo === 'GESTOR' ? 'Gestor' : 'Funcionário')
          setLogado(true)
        }
      } catch (erro) {
        if (ativo && erro.status !== 401) {
          setErroSessao('Não foi possível verificar sua sessão. Confira a conexão com a API e tente novamente.')
        }
      } finally {
        if (ativo) {
          setVerificandoSessao(false)
        }
      }
    }

    recuperarSessao()

    return () => {
      ativo = false
    }
  }, [])

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

  if (verificandoSessao) {
    return (
      <main className="session-status session-loading" role="status" aria-live="polite">
        <span className="session-brand" aria-hidden="true">Qualiflow</span>
        <span className="session-spinner" aria-hidden="true" />
        <h1>Verificando sua sessão</h1>
        <p>Aguarde enquanto confirmamos seu acesso.</p>
      </main>
    )
  }

  if (erroSessao) {
    return (
      <main className="session-status">
        <p role="alert">{erroSessao}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </main>
    )
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
