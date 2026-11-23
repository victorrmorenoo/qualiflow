import { useEffect, useState } from 'react'
import { buscarGarrafas } from '../services/api'

const medicoesApi = [
  {
    campo: 'massa_g',
    nome: 'Massa',
    unidade: 'g',
    minimo: 35,
    maximo: 55,
  },
  {
    campo: 'espessura_corpo_mm',
    nome: 'Espessura do corpo',
    unidade: 'mm',
    minimo: 0.15,
    maximo: 0.45,
  },
  {
    campo: 'espessura_ombro_mm',
    nome: 'Espessura do ombro',
    unidade: 'mm',
    minimo: 0.30,
    maximo: 0.55,
  },
  {
    campo: 'diametro_gargalo_mm',
    nome: 'Diâmetro do gargalo',
    unidade: 'mm',
    minimo: 23.95,
    maximo: 24.45,
  },
  {
    campo: 'altura_mm',
    nome: 'Altura',
    unidade: 'mm',
    minimo: 347,
    maximo: 361,
  },
  {
    campo: 'volume_util_ml',
    nome: 'Volume útil',
    unidade: 'mL',
    minimo: 1970,
    maximo: 2030,
  },
]

const statuses = ['Conforme', 'Atenção', 'Fora do padrão']
const shifts = ['Manhã', 'Tarde', 'Noite']
const lines = ['Sopro_01', 'Sopro_02', 'Sopro_03', 'Sopro_04']
const colors = ['#34d399', '#c084fc', '#ec4899']

const format = (value, digits = 2) =>
  Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: digits,
  })

const shortDate = (date) =>
  `${date.slice(8, 10)}/${date.slice(5, 7)}`

const getDates = () => {
  const today = new Date()
  const result = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    result.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    )
  }

  return result
}

const dates = getDates()

const views = {
  overview: [
    'Controle de qualidade',
    'Acompanhe as medições e os desvios das garrafas PET de 2 L.',
  ],
  measurements: [
    'Medições',
    'Compare os resultados com a faixa de aceitação de cada medida.',
  ],
  inspections: [
    'Inspeções',
    'Consulte as amostras recentes e filtre pela situação.',
  ],
  reports: [
    'Relatórios',
    'Acompanhe os resultados e indicadores da produção.',
  ],
  costs: [
    'Estimativa de material',
    'Consulte a massa das garrafas inspecionadas e estime o custo do material.',
  ],
}

function Dashboard({ perfil, onSair, onCadastrar }) {
  const [view, setView] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)

  const [period, setPeriod] = useState('7')
  const [shift, setShift] = useState('')
  const [line, setLine] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState(dates[23])
  const [to, setTo] = useState(dates[29])
  const [garrafas, setGarrafas] = useState([])
  const [precoKg, setPrecoKg] = useState('8.40')
  const [erroDados, setErroDados] = useState('')
  const [carregando, setCarregando] = useState(true)

  const [campoMedicao, setCampoMedicao] = useState('massa_g')

  const custom = period === 'custom'

  const startDate = custom ? from : dates[30 - Number(period)]
  const endDate = custom ? to : dates[29]

  const valid = Boolean(
    startDate && endDate && startDate <= endDate
  )

  useEffect(() => {
    let ativo = true

    if (!valid) {
      return () => {
        ativo = false
      }
    }

    const periodos = {
      '1': 'HOJE',
      '7': 'ULTIMOS_7_DIAS',
      '30': 'ULTIMOS_30_DIAS',
      custom: 'PERSONALIZADO',
    }

    const situacoes = {
      Conforme: 'Conforme',
      Atenção: 'Revisao',
      'Fora do padrão': 'Reprovado',
    }

    async function carregar() {
      setCarregando(true)
      setErroDados('')

      try {
        const resultado = await buscarGarrafas({
          periodo: periodos[period],
          turno: shift,
          linha: line,
          status: situacoes[statusFilter],
          ...(custom ? { dataInicio: from, dataFim: to } : {}),
        })

        if (ativo) {
          setGarrafas(resultado)
        }
      } catch (erro) {
        if (ativo) {
          setGarrafas([])
          setErroDados(erro.message)
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [period, shift, line, statusFilter, custom, from, to, valid])


  const statusDaApi = ['Conforme', 'Revisao', 'Reprovado']

  const counts = statusDaApi.map(status =>
    garrafas.filter(garrafa => garrafa.status_qualidade === status).length
  )

  const rate = garrafas.length
    ? (counts[0] / garrafas.length) * 100
    : 0

  const split = garrafas.length
    ? ((counts[0] + counts[1]) / garrafas.length) * 100
    : 0

  const percentage = garrafas.length
    ? `${format(rate, 1)}%`
    : '—'

  const massaKg = garrafas.reduce(
    (total, garrafa) => total + garrafa.massa_g,
    0
  ) / 1000

  const massaDescartadaKg = garrafas.reduce(
    (total, garrafa) => garrafa.status_qualidade === 'Reprovado'
      ? total + garrafa.massa_g
      : total,
    0
  ) / 1000

  const precoValido = precoKg.trim() !== '' &&
    Number.isFinite(Number(precoKg)) && Number(precoKg) >= 0

  const custoEstimado = precoValido ? massaKg * Number(precoKg) : null
  const custoDesperdicado = precoValido
    ? massaDescartadaKg * Number(precoKg)
    : null

  const brl = (value) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const cards = [
    ['Garrafas registradas', garrafas.length, ''],
    ['Conformidade', percentage, ''],
    ['Em atenção', counts[1], 'warn'],
    ['Fora do padrão', counts[2], 'error'],
  ]

  const costCards = [
    ['Massa das garrafas inspecionadas',
      carregando || erroDados ? '—' : `${format(massaKg, 3)} kg`,
      'Soma da massa no recorte filtrado', ''],
    ['Custo estimado do material',
      carregando || erroDados || custoEstimado === null ? '—' : brl(custoEstimado),
      'Massa das amostras × preço informado por kg', ''],
    ['Custo desperdiçado estimado',
      carregando || erroDados || custoDesperdicado === null
        ? '—'
        : brl(custoDesperdicado),
      `${format(massaDescartadaKg, 3)} kg de garrafas reprovadas`,
      'error'],
  ]
  const medicaoSelecionada = medicoesApi.find(
    medicao => medicao.campo === campoMedicao
  )

  const {
    nome: metricName,
    unidade: unit,
    minimo: lo,
    maximo: hi,
  } = medicaoSelecionada

  const trend = [...garrafas]
    .sort((a, b) =>
      a.data_hora.localeCompare(b.data_hora) ||
      a.id_registro - b.id_registro
    )
    .map((garrafa, i) => ({
      id: garrafa.id_registro,
      date: garrafa.data_hora,
      time: Date.parse(`${garrafa.data_hora}Z`),
      i,
      value: garrafa[campoMedicao],
      status: statusDaApi.indexOf(garrafa.status_qualidade),
    }))

  const chartDates = trend.map(ponto => ponto.date)

  const pad = (hi - lo) * 0.12

  const min = trend.reduce(
    (menor, ponto) => Math.min(menor, ponto.value),
    lo
  ) - pad

  const max = trend.reduce(
    (maior, ponto) => Math.max(maior, ponto.value),
    hi
  ) + pad

  const primeiroHorario = trend[0]?.time
  const ultimoHorario = trend[trend.length - 1]?.time

  const x = i =>
    primeiroHorario === ultimoHorario
      ? 315
      : 58 + (
        (trend[i].time - primeiroHorario) /
        (ultimoHorario - primeiroHorario)
      ) * 515

  const y = valor => 200 - ((valor - min) * 178) / (max - min)

  const trendPoints = trend.map(ponto => ({
    ...ponto,
    x: x(ponto.i),
    y: y(ponto.value),
  }))

  const caminhoGrafico = trendPoints
    .map((ponto, i) =>
      `${i === 0 ? 'M' : 'L'} ${ponto.x} ${ponto.y}`
    )
    .join(' ')

  const passoMarcadores = Math.max(
    1,
    Math.ceil(trendPoints.length / 100)
  )

  const marcadores = trendPoints.filter((_, i) =>
    i % passoMarcadores === 0 || i === trendPoints.length - 1
  )

  const recent = [...garrafas]
    .sort((a, b) =>
      b.data_hora.localeCompare(a.data_hora) ||
      b.id_registro - a.id_registro
    )
    .slice(0, 12)
    .map(garrafa => ({
      id: garrafa.id_registro,
      date: garrafa.data_hora,
      shift: garrafa.turno,
      line: garrafa.linha_sopro,
      name: metricName,
      value: garrafa[campoMedicao],
      unit,
      status: statusDaApi.indexOf(garrafa.status_qualidade),
    }))

  const reportCounts = counts
  const reportTotal = garrafas.length
  const reportPercentage = percentage

  function clearFilters() {
    setPeriod('7')
    setShift('')
    setLine('')
    setStatusFilter('')
    setFrom(dates[23])
    setTo(dates[29])
  }

  const [title, description] = views[view]

  return (
    <div className="dashboard">
      <header className="top">
        <div className="top-left">
          <div className="actions">
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              ☰
            </button>

            <div className="brand">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M27 41A18 18 0 1 1 40 27"
                  stroke="#9b5cff"
                  strokeWidth="6"
                  fill="none"
                />
                <path
                  d="M15 25c9-7 13 16 30 17"
                  stroke="#7567ff"
                  strokeWidth="6"
                  fill="none"
                />
                <path
                  d="M26 21c7-3 12 2 18 6"
                  stroke="#c084fc"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
              Qualiflow
            </div>
          </div>
        </div>

        <div className="actions">
          <span className="tag">{perfil}</span>

          {perfil === 'Gestor' && (
            <button className="primary" onClick={onCadastrar}>
              + Cadastrar funcionário
            </button>
          )}

          <button className="btn-sair" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>

      <div className={`workspace ${menuOpen ? '' : 'menu-closed'}`}>
        {menuOpen && (
          <aside className="sidebar">
            <span className="eyebrow">Monitoramento</span>

            <nav>
              {Object.keys(views).map((key) => (
                <button
                  key={key}
                  className={view === key ? 'active' : ''}
                  onClick={() => setView(key)}
                >
                  {{
                    overview: 'Visão geral',
                    measurements: 'Medições',
                    inspections: 'Inspeções',
                    reports: 'Relatórios',
                    costs: 'Estimativa de material',
                  }[key]}
                </button>
              ))}
            </nav>

            <small>Garrafas PET de 2 L</small>
          </aside>
        )}

        <main className="dashboard-main">
          {carregando ? (
            <p role="status">Carregando garrafas...</p>
          ) : erroDados ? (
            <p role="alert">{erroDados}</p>
          ) : null}
          <div className="heading">
            <div>
              <div className="eyebrow">
                Controle de qualidade de garrafas PET
              </div>
              <h1>{title}</h1>
              <p className="muted">{description}</p>
            </div>
          </div>

          <section className="panel filters">
            <div className="tools">
              <label>
                Por tempo
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="1">Hoje</option>
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="custom">Intervalo personalizado</option>
                </select>
              </label>

              <label>
                Por turno
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option value="">Todos os turnos</option>
                  {shifts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Por linha de produção
                <select
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                >
                  <option value="">Todas as linhas</option>
                  {lines.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Por conformidade
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todas as situações</option>
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              {custom && (
                <div className="tools custom-dates">
                  <label>
                    Data inicial
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                    />
                  </label>

                  <label>
                    Data final
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <button className="clear-filters" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>

            {!valid && (
              <p className="filter-error">
                Informe as duas datas. A data inicial deve ser anterior
                ou igual à final.
              </p>
            )}
          </section>

          {view === 'overview' && (
            <section className="cards">
              {cards.map(([label, value, style]) => (
                <div className={`card ${style}`} key={label}>
                  {label}
                  <strong>{value}</strong>
                </div>
              ))}
            </section>
          )}

          {(view === 'overview' || view === 'costs') && (
            <section className="cards cost-grid">
              {costCards.map(([label, value, detail, style]) => (
                <div className={`card ${style}`} key={label}>
                  {label}
                  <strong>{value}</strong>
                  <small className="muted">{detail}</small>
                </div>
              ))}
            </section>
          )}

          {(view === 'overview' || view === 'measurements') && (
            <div className="charts">
              <section className="panel">
                <header className="panel-header">
                  <div>
                    <h2>Tendência das medições</h2>
                    <p className="muted">
                      Uma medição por garrafa · Faixa de aceitação de {format(lo)} a{' '}
                      {format(hi)} {unit}
                    </p>
                  </div>

                  <select
                    aria-label="Medição"
                    value={campoMedicao}
                    onChange={event => setCampoMedicao(event.target.value)}
                  >
                    {medicoesApi.map(medicao => (
                      <option key={medicao.campo} value={medicao.campo}>
                        {medicao.nome}
                      </option>
                    ))}
                  </select>
                </header>

                <svg
                  className="plot"
                  viewBox="0 0 600 245"
                  role="img"
                  aria-label={`Medições de ${metricName} por garrafa, em ${unit}`}
                >
                  <defs>
                    <linearGradient
                      id="purpleArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#a855f7" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#7567ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {trend.length > 0 && (
                    <>
                      <rect
                        x="58"
                        y={y(hi)}
                        width="515"
                        height={y(lo) - y(hi)}
                        fill="url(#purpleArea)"
                      />

                      {[hi, (hi + lo) / 2, lo].map((v, i) => (
                        <g key={i}>
                          <line
                            x1="58"
                            x2="573"
                            y1={y(v)}
                            y2={y(v)}
                            stroke={i === 1 ? '#40345f' : '#d66bff'}
                            strokeDasharray="5 5"
                            opacity=".7"
                          />
                          <text
                            x="50"
                            y={y(v) + 4}
                            textAnchor="end"
                            fill="#aaa2cc"
                            fontSize="12"
                          >
                            {format(v)}
                          </text>
                        </g>
                      ))}

                      <path
                        d={caminhoGrafico}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />

                      {marcadores.map(point => (
                        <circle
                          key={point.id}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          stroke={colors[point.status]}
                          strokeWidth="2"
                          fill="#111426"
                        >
                          <title>
                            PET-{point.id} · {shortDate(point.date)}{' '}
                            {point.date.slice(11, 16)} · {format(point.value)} {unit}
                          </title>
                        </circle>
                      ))}

                      {chartDates.map((date, i) =>
                        i % Math.ceil(chartDates.length / 8) === 0 ||
                          i === chartDates.length - 1 ? (
                          <text
                            key={i}
                            x={x(i)}
                            y="225"
                            textAnchor="middle"
                            fill="#aaa2cc"
                            fontSize="12"
                          >
                            {shortDate(date)}
                          </text>
                        ) : null
                      )}
                    </>
                  )}

                  {!trend.length && (
                    <text
                      x="300"
                      y="122"
                      textAnchor="middle"
                      fill="#aaa2cc"
                      fontSize="18"
                    >
                      Nenhuma medição neste recorte.
                    </text>
                  )}
                </svg>

                <div className="legend">
                  <span className="key">
                    <i className="purple-line" /> Medição
                  </span>
                  <span className="key">
                    <i className="limit-line" /> Limites de aceitação
                  </span>
                </div>
              </section>

              <section className="panel">
                <h2>Resultado das inspeções</h2>
                <p className="muted">
                  Distribuição no período selecionado
                </p>

                <div className="ring-wrap">
                  <div
                    className="ring"
                    style={{
                      background: garrafas.length
                        ? `conic-gradient(
                            ${colors[0]} 0 ${rate}%,
                            ${colors[1]} ${rate}% ${split}%,
                            ${colors[2]} ${split}% 100%
                          )`
                        : '#30294f',
                    }}
                  >
                    <div>
                      <strong>{percentage}</strong>
                      <small>Conformes</small>
                    </div>
                  </div>
                </div>

                <div className="legend">
                  {statuses.map((name, i) => (
                    <span className="key" key={name}>
                      <i style={{ background: colors[i] }} />
                      {name} · {counts[i]}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          )}

          {(view === 'overview' || view === 'inspections') && (
            <section className="panel">
              <header className="panel-header">
                <div>
                  <h2>Inspeções recentes</h2>
                  <p className="muted">
                    Amostras ilustrativas da linha de produção
                  </p>
                </div>
              </header>

              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Amostra</th>
                      <th>Dia</th>
                      <th>Turno</th>
                      <th>Linha</th>
                      <th>Medição</th>
                      <th>Valor</th>
                      <th>Situação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recent.length ? (
                      recent.map((row) => (
                        <tr key={row.id}>
                          <td>PET-{row.id}</td>
                          <td>{shortDate(row.date)}</td>
                          <td>{row.shift}</td>
                          <td>{row.line}</td>
                          <td>{row.name}</td>
                          <td>{format(row.value)} {row.unit}</td>
                          <td>
                            <span
                              className={`status ${row.status === 1
                                ? 'warn'
                                : row.status === 2
                                  ? 'error'
                                  : ''
                                }`}
                            >
                              {statuses[row.status]}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">
                          Nenhuma inspeção para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* RELATÓRIOS */}
          {view === 'reports' && (
            <>
              <section className="cards">
                <div className="card">
                  Total de garrafas
                  <strong>{reportTotal}</strong>
                </div>

                <div className="card">
                  Índice de conformidade
                  <strong>{reportPercentage}</strong>
                </div>

                <div className="card warn">
                  Em atenção
                  <strong>{reportCounts[1]}</strong>
                </div>

                <div className="card error">
                  Fora do padrão
                  <strong>{reportCounts[2]}</strong>
                </div>
              </section>

              <section className="panel">
                <h2>Resumo de qualidade</h2>
                <p className="muted">
                  Resultados considerando período, turno, linha e conformidade selecionados.
                </p>

                <div className="report-list">
                  <div>
                    <span>Índice de conformidade</span>
                    <strong>{reportPercentage}</strong>
                  </div>

                  <div>
                    <span>Taxa de atenção</span>
                    <strong>
                      {reportTotal
                        ? `${format(reportCounts[1] / reportTotal * 100, 1)}%`
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Taxa fora do padrão</span>
                    <strong>
                      {reportTotal
                        ? `${format(reportCounts[2] / reportTotal * 100, 1)}%`
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Massa das garrafas inspecionadas</span>
                    <strong>{format(massaKg, 3)} kg</strong>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ESTIMATIVA DE MATERIAL */}
          {view === 'costs' && (
            <section className="panel cost-detail">
              <h2>Estimativa de material das inspeções</h2>
              <label htmlFor="precoKg">Preço do PET por kg em reais</label>
              <input
                id="precoKg"
                type="number"
                min="0"
                step="0.01"
                value={precoKg}
                onChange={event => setPrecoKg(event.target.value)}
                required
              />
              {!precoValido && (
                <p role="alert">Informe um preço maior ou igual a zero.</p>
              )}
              <p>
                Somamos massa_g das garrafas retornadas pela API e dividimos
                por 1.000 para obter quilogramas. O custo estimado corresponde
                a essa massa multiplicada pelo preço informado.
              </p>
              <p>
                Toda garrafa com status Reprovado é considerada descartada.
                O custo desperdiçado estimado corresponde à massa dessas
                garrafas em kg multiplicada pelo preço informado.
                Esse valor já faz parte do custo estimado do material.
              </p>
              <p className="muted">
                A estimativa corresponde às garrafas inspecionadas no período,
                turno, linha e conformidade selecionados.
              </p>
            </section>
          )}
          <footer>
            Qualiflow · Inspeções consultadas na API
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
