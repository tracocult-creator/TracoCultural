import React, { useEffect, useMemo, useState } from 'react'
import api from '../../servicos/api'

const cards = [
  { key: 'totalUsuarios',     label: 'Usuários',           icon: 'bi-people' },
  { key: 'totalAdmins',       label: 'Administradores',    icon: 'bi-shield-check' },
  { key: 'totalEventos',      label: 'Eventos',            icon: 'bi-calendar-event' },
  { key: 'totalComentarios',  label: 'Comentários',        icon: 'bi-chat-dots' },
  { key: 'eventosDestacados', label: 'Destaques',          icon: 'bi-star' },
]

const CORES_GRAFICO = ['#D4A373', '#8E5E56', '#B8864E', '#3C2321', '#c98f5e', '#a97354', '#6f4a44', '#e0b98a']

function DonutChart({ data, size = 150, thickness = 20 }) {
  const total = data.reduce((s, d) => s + d.valor, 0) || 1
  const raio = (size - thickness) / 2
  const circunferencia = 2 * Math.PI * raio
  let acumulado = 0

  return (
    <div className="admin-chart-donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={raio} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={thickness} />
          {data.map((d, i) => {
            if (d.valor <= 0) return null
            const fracao = d.valor / total
            const comprimento = fracao * circunferencia
            const offset = circunferencia - acumulado
            acumulado += comprimento
            return (
              <circle
                key={d.label}
                cx={size / 2} cy={size / 2} r={raio}
                fill="none"
                stroke={d.cor || CORES_GRAFICO[i % CORES_GRAFICO.length]}
                strokeWidth={thickness}
                strokeDasharray={`${comprimento} ${circunferencia - comprimento}`}
                strokeDashoffset={offset}
              />
            )
          })}
        </g>
      </svg>
      <div className="admin-chart-donut-center">
        <strong>{total}</strong>
        <span>total</span>
      </div>
    </div>
  )
}

function BarChartHorizontal({ data }) {
  const max = Math.max(...data.map((d) => d.valor), 1)
  return (
    <div className="admin-chart-bars">
      {data.map((d, i) => (
        <div className="admin-chart-bar-row" key={d.label}>
          <span className="admin-chart-bar-label" title={d.label}>{d.label}</span>
          <div className="admin-chart-bar-track">
            <div
              className="admin-chart-bar-fill"
              style={{ width: `${(d.valor / max) * 100}%`, background: CORES_GRAFICO[i % CORES_GRAFICO.length] }}
            />
          </div>
          <span className="admin-chart-bar-valor">{d.valor}</span>
        </div>
      ))}
    </div>
  )
}

function Legenda({ data }) {
  return (
    <ul className="admin-chart-legenda">
      {data.map((d, i) => (
        <li key={d.label}>
          <span className="admin-chart-legenda-dot" style={{ background: d.cor || CORES_GRAFICO[i % CORES_GRAFICO.length] }} />
          {d.label} <strong>{d.valor}</strong>
        </li>
      ))}
    </ul>
  )
}

const Dashboard = ({ showToast }) => {
  const [stats, setStats] = useState(null)
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/eventos'),
    ])
      .then(([resStats, resEventos]) => {
        setStats(resStats.data)
        setEventos(Array.isArray(resEventos.data) ? resEventos.data : [])
      })
      .catch(() => showToast('Erro ao carregar dashboard.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const porCategoria = useMemo(() => {
    const contagem = {}
    eventos.forEach((e) => {
      const nome = e.categoria?.nome || 'Sem categoria'
      contagem[nome] = (contagem[nome] || 0) + 1
    })
    return Object.entries(contagem)
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8)
  }, [eventos])

  const composicaoUsuarios = useMemo(() => {
    if (!stats) return []
    const admins = stats.totalAdmins ?? 0
    const comuns = Math.max((stats.totalUsuarios ?? 0) - admins, 0)
    return [
      { label: 'Usuários comuns', valor: comuns, cor: CORES_GRAFICO[0] },
      { label: 'Administradores', valor: admins, cor: CORES_GRAFICO[1] },
    ]
  }, [stats])

  const statusEventos = useMemo(() => {
    if (!stats) return []
    const destacados = stats.eventosDestacados ?? 0
    const padrao = Math.max((stats.totalEventos ?? 0) - destacados, 0)
    return [
      { label: 'Padrão', valor: padrao, cor: CORES_GRAFICO[2] },
      { label: 'Destacados', valor: destacados, cor: CORES_GRAFICO[3] },
    ]
  }, [stats])

  if (loading) return <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visão Geral</h2>
      </div>
      <div className="admin-stats">
        {cards.map(({ key, label, icon }) => (
          <div className="admin-stat-card" key={key}>
            <span className="admin-stat-icon"><i className={`bi ${icon}`}></i></span>
            <span className="admin-stat-value">{stats?.[key] ?? '—'}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-section-header" style={{ marginTop: '.5rem' }}>
        <h2 className="admin-section-title">Gráficos</h2>
      </div>
      <div className="admin-charts-grid">
        <div className="admin-chart-card admin-chart-card--wide">
          <h3 className="admin-chart-title">Eventos por categoria</h3>
          {porCategoria.length > 0
            ? <BarChartHorizontal data={porCategoria} />
            : <p className="admin-chart-vazio">Nenhum evento cadastrado ainda.</p>}
        </div>

        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Composição da comunidade</h3>
          <div className="admin-chart-donut-row">
            <DonutChart data={composicaoUsuarios} />
            <Legenda data={composicaoUsuarios} />
          </div>
        </div>

        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Status dos eventos</h3>
          <div className="admin-chart-donut-row">
            <DonutChart data={statusEventos} />
            <Legenda data={statusEventos} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard