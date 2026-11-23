const API_URL = import.meta.env.VITE_API_URL

export async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    credentials: 'include',
    headers: {
      ...opcoes.headers,
      ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })

  if (!resposta.ok) {
    const mensagens = {
      400: 'Confira os dados informados.',
      401: 'Credenciais inválidas ou sessão expirada.',
      403: 'Você não tem permissão para esta operação.',
      409: 'Este e-mail já está cadastrado.',
    }

    const erro = new Error(
      mensagens[resposta.status] ?? 'Não foi possível concluir a operação.'
    )

    erro.status = resposta.status
    throw erro
  }

  if (resposta.status === 204) {
    return null
  }

  return resposta.json()
}

export function fazerLogin(dados) {
  return requisitar('/login', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function buscarUsuarioLogado() {
  return requisitar('/usuarios/me')
}

export function fazerLogout() {
  return requisitar('/logout', {
    method: 'POST',
  })
}

export function cadastrarUsuario(dados) {
  return requisitar('/usuarios', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function buscarGarrafas(filtros = {}) {
  const parametros = new URLSearchParams()

  for (const [nome, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null && valor !== undefined) {
      parametros.set(nome, valor)
    }
  }

  const consulta = parametros.toString()

  return requisitar(`/garrafas${consulta ? `?${consulta}` : ''}`)
}