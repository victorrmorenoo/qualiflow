import { useEffect, useMemo, useState } from 'react'
import { buscarGarrafas } from '../services/api'

const metrics = [
  ['Massa', 'g', 35, 55, 48],
  ['Espessura do ombro', 'mm', 0.30, 0.55, 0.40],
  ['Espessura do corpo', 'mm', 0.15, 0.45, 0.25],
  ['Espessura dos pés', 'mm', 0.22, 0.60, 0.35],
  ['Espessura central do fundo', 'mm', 1.30, 2, 1.5],
  ['Rosca do gargalo', 'mm', 23.95, 24.45, 24.20],
  ['Corpo do gargalo', 'mm', 27.15, 27.65, 27.40],
  ['Altura', 'mm', 347, 361, 354],
  ['Volume útil', 'mL', 1970, 2030, 1970],
  ['Volume de transbordo', 'mL', 2040, 2095, 2065],
]

const offsets = [
  0.05, 0.13, -0.08, 0.17, 0.02, -0.14, 0.22,
  0.04, -0.05, 0.1, 0.03, 0.18, -0.10, 0.06,
]

const statuses = ['Conforme', 'Atenção', 'Fora do padrão']
const shifts = ['Manhã', 'Tarde', 'Noite']
const lines = ['Sopro_01', 'Sopro_02', 'Sopro_03', 'Sopro_04']
const colors = ['#34d399', '#c084fc', '#ec4899']

const format = (value, digits = 2) =>
  Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: digits,
  })

const classify = (value, lo, hi) =>
  value < lo || value > hi
    ? 2
    : Math.min(value - lo, hi - value) <= (hi - lo) * 0.05
      ? 1
      : 0

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

const production = dates.flatMap((date, day) =>
  shifts.flatMap((shift, i) =>
    lines.map((line, j) => ({
      date,
      day,
      shift,
      line,
      group: i * lines.length + j,
      consumed: 37 + (day * 5 + i * 7 + j * 3) % 12,
      discarded: (day + i * 2 + j * 3) % 3,
    }))
  )
)

const data = production.flatMap((batch) =>
  metrics.map(([name, unit, lo, hi, target], index) => {
    const center = target === lo ? (lo + hi) / 2 : target
    const sample = (batch.day * 11 + batch.group * 13 + index * 7) % 41

    const offset =
      sample === 0
        ? -0.72
        : sample === 1
          ? (hi - center) / (hi - lo) - 0.01
          : offsets[sample % offsets.length]

    const value =
      Math.round((center + offset * (hi - lo)) * 100) / 100

    const id =
      1001 +
      (batch.day * shifts.length * lines.length + batch.group) *
      metrics.length +
      index

    return {
      ...batch,
      id,
      index,
      name,
      unit,
      value,
      status: classify(value, lo, hi),
    }
  })
)

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
  nonconformities: [
    'Não conformidades',
    'Registre e acompanhe os defeitos encontrados nas garrafas.',
  ],
  lots: [
    'Controle de lotes',
    'Consulte a produção por lote, linha e turno.',
  ],
  reports: [
    'Relatórios',
    'Acompanhe os resultados e indicadores da produção.',
  ],
  costs: [
    'Custos e desperdício',
    'Confira o gasto com matéria-prima e o custo do PET descartado.',
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

  const [nonconformities, setNonconformities] = useState([])
  const [defect, setDefect] = useState('')
  const [defectLine, setDefectLine] = useState('Sopro_01')
  const [defectShift, setDefectShift] = useState('Manhã')
  const [defectDescription, setDefectDescription] = useState('')
  const [garrafas, setGarrafas] = useState([])
  const [erroDados, setErroDados] = useState('')
  const [carregando, setCarregando] = useState(true)

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


  const visibleProduction = useMemo(
    () =>
      production.filter(
        (row) =>
          valid &&
          row.date >= startDate &&
          row.date <= endDate &&
          (!shift || row.shift === shift) &&
          (!line || row.line === line)
      ),
    [valid, startDate, endDate, shift, line]
  )

  const visible = useMemo(
    () =>
      data.filter(
        (row) =>
          valid &&
          row.date >= startDate &&
          row.date <= endDate &&
          (!shift || row.shift === shift) &&
          (!line || row.line === line) &&
          (!statusFilter || statuses[row.status] === statusFilter)
      ),
    [valid, startDate, endDate, shift, line, statusFilter]
  )

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

  const consumed = visibleProduction.reduce(
    (sum, row) => sum + row.consumed,
    0
  )

  const discarded = visibleProduction.reduce(
    (sum, row) => sum + row.discarded,
    0
  )

  const petPrice = 8.4

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
    [
      'Gasto total com PET',
      brl(consumed * petPrice),
      `${format(consumed)} kg consumidos`,
      '',
    ],
    [
      'Custo do desperdício',
      brl(discarded * petPrice),
      `${format(discarded)} kg descartados`,
      'error',
    ],
    [
      'Taxa de desperdício',
      consumed
        ? `${format((discarded / consumed) * 100, 1)}%`
        : '—',
      'do PET consumido',
      '',
    ],
  ]

  const metricName = 'Massa'
  const unit = 'g'

  // Limites que já estavam definidos no protótipo.
  // Confirme esses valores com os requisitos do projeto.
  const lo = 35
  const hi = 55

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
      value: garrafa.massa_g,
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
      name: 'Massa',
      value: garrafa.massa_g,
      unit: 'g',
      status: statusDaApi.indexOf(garrafa.status_qualidade),
    }))

  const reportCounts = statuses.map((_, i) =>
    data.filter(
      (row) =>
        valid &&
        row.date >= startDate &&
        row.date <= endDate &&
        (!shift || row.shift === shift) &&
        (!line || row.line === line) &&
        row.status === i
    ).length
  )

  const reportTotal = reportCounts.reduce((sum, value) => sum + value, 0)

  const reportPercentage = reportTotal
    ? `${format((reportCounts[0] / reportTotal) * 100, 1)}%`
    : '—'

  const visibleNonconformities = nonconformities.filter(
    (item) =>
      (!shift || item.shift === shift) &&
      (!line || item.line === line) &&
      valid &&
      item.date >= startDate &&
      item.date <= endDate
  )

  function clearFilters() {
    setPeriod('7')
    setShift('')
    setLine('')
    setStatusFilter('')
    setFrom(dates[23])
    setTo(dates[29])
  }

  function registerNonconformity(event) {
    event.preventDefault()

    if (!defect || !defectDescription.trim()) return

    const newRecord = {
      id: Date.now(),
      defect,
      line: defectLine,
      shift: defectShift,
      description: defectDescription.trim(),
      date: new Date().toISOString().slice(0, 10),
    }

    setNonconformities((previous) => [newRecord, ...previous])
    setDefect('')
    setDefectDescription('')
    setDefectLine('Sopro_01')
    setDefectShift('Manhã')
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
                    nonconformities: 'Não conformidades',
                    lots: 'Controle de lotes',
                    reports: 'Relatórios',
                    costs: 'Custos e desperdício',
                  }[key]}
                </button>
              ))}
            </nav>

            <small>Planta 2 · Linha PET 2 L</small>
          </aside>
        )}

        <main className="dashboard-main">
          {carregando ? (
            <p role="status">Carregando garrafas...</p>
          ) : erroDados ? (
            <p role="alert">{erroDados}</p>
          ) : (
            <p role="status">
              {garrafas.length} garrafas recebidas da API.
            </p>
          )}
          <div className="heading">
            <div>
              <div className="eyebrow">
                Planta 2 · Sopro e moldagem
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

                  <select aria-label="Medição" value="massa" disabled>
                    <option value="massa">Massa</option>
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

          {/* NÃO CONFORMIDADES */}
          {view === 'nonconformities' && (
            <>
              <section className="panel">
                <h2>Registrar não conformidade</h2>
                <p className="muted">
                  Informe o defeito encontrado durante a inspeção.
                </p>

                <form className="defect-form" onSubmit={registerNonconformity}>
                  <label>
                    Tipo de defeito
                    <select
                      value={defect}
                      onChange={(e) => setDefect(e.target.value)}
                      required
                    >
                      <option value="">Selecione o defeito</option>
                      <option value="Vazamento">Vazamento</option>
                      <option value="Deformação">Deformação</option>
                      <option value="Trinca">Trinca</option>
                      <option value="Espessura irregular">Espessura irregular</option>
                      <option value="Problema no gargalo">Problema no gargalo</option>
                      <option value="Problema no fundo">Problema no fundo</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </label>

                  <label>
                    Linha de produção
                    <select
                      value={defectLine}
                      onChange={(e) => setDefectLine(e.target.value)}
                    >
                      {lines.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Turno
                    <select
                      value={defectShift}
                      onChange={(e) => setDefectShift(e.target.value)}
                    >
                      {shifts.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label className="description-field">
                    Descrição do problema
                    <textarea
                      value={defectDescription}
                      onChange={(e) => setDefectDescription(e.target.value)}
                      placeholder="Descreva o defeito encontrado..."
                      required
                    />
                  </label>

                  <button className="primary" type="submit">
                    + Registrar defeito
                  </button>
                </form>
              </section>

              <section className="panel">
                <header className="panel-header">
                  <div>
                    <h2>Registros de não conformidade</h2>
                    <p className="muted">
                      Defeitos registrados durante as inspeções.
                    </p>
                  </div>
                  <span className="tag">
                    {visibleNonconformities.length} registros
                  </span>
                </header>

                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Defeito</th>
                        <th>Linha</th>
                        <th>Turno</th>
                        <th>Descrição</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleNonconformities.length ? (
                        visibleNonconformities.map((item) => (
                          <tr key={item.id}>
                            <td>{shortDate(item.date)}</td>
                            <td>
                              <span className="status error">{item.defect}</span>
                            </td>
                            <td>{item.line}</td>
                            <td>{item.shift}</td>
                            <td>{item.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">
                            Nenhuma não conformidade registrada neste período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* CONTROLE DE LOTES */}
          {view === 'lots' && (
            <section className="panel">
              <header className="panel-header">
                <div>
                  <h2>Lotes de produção</h2>
                  <p className="muted">
                    Acompanhe a produção por data, linha e turno.
                  </p>
                </div>
                <span className="tag">
                  {visibleProduction.length} registros
                </span>
              </header>

              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Identificação do lote</th>
                      <th>Data</th>
                      <th>Linha</th>
                      <th>Turno</th>
                      <th>Consumo PET</th>
                      <th>Descarte</th>
                      <th>Situação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleProduction.length ? (
                      [...visibleProduction]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((row) => (
                          <tr key={`${row.date}-${row.shift}-${row.line}`}>
                            <td>
                              LOTE-{row.date.replaceAll('-', '')}-{row.group + 1}
                            </td>
                            <td>{shortDate(row.date)}</td>
                            <td>{row.line}</td>
                            <td>{row.shift}</td>
                            <td>{format(row.consumed)} kg</td>
                            <td>{format(row.discarded)} kg</td>
                            <td>
                              <span className={`status ${row.discarded > 1 ? 'warn' : ''}`}>
                                {row.discarded > 1 ? 'Atenção' : 'Em produção'}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="7">
                          Nenhum lote encontrado para os filtros.
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
                  Total de medições
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
                  Resultados considerando o período, turno e linha selecionados.
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
                    <span>Não conformidades registradas</span>
                    <strong>{visibleNonconformities.length}</strong>
                  </div>

                  <div>
                    <span>PET consumido</span>
                    <strong>{format(consumed)} kg</strong>
                  </div>

                  <div>
                    <span>PET descartado</span>
                    <strong>{format(discarded)} kg</strong>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* DETALHES DE CUSTOS */}
          {view === 'costs' && (
            <section className="panel cost-detail">
              <h2>Como os valores são calculados</h2>

              <p>
                {!consumed
                  ? 'Sem dados de produção para este recorte.'
                  : `${format(consumed)} kg consumidos × ${brl(petPrice)} por kg. Desse total, ${format(discarded)} kg foram descartados.`}
              </p>

              <p className="muted">
                A simulação usa o preço fixo de R$ 8,40 por kg de PET.
                O gasto com material descartado já está incluído no
                gasto total com PET.
              </p>

              <p className="muted">
                Os custos usam o período, o turno e a linha selecionados.
                O filtro de conformidade se aplica às medições e
                inspeções, pois os custos representam a produção.
              </p>
            </section>
          )}

          <footer>
            Qualiflow · Dados simulados para demonstração
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
