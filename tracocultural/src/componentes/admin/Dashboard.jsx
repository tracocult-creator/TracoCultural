import React, { useEffect, useState } from 'react'
import api from '../../servicos/api'

const cards = [
  { key: 'totalUsuarios',     label: 'Usuários',           icon: 'bi-people' },
  { key: 'totalAdmins',       label: 'Administradores',    icon: 'bi-shield-check' },
  { key: 'totalEventos',      label: 'Eventos',            icon: 'bi-calendar-event' },
  { key: 'totalComentarios',  label: 'Comentários',        icon: 'bi-chat-dots' },
  { key: 'eventosDestacados', label: 'Destaques',          icon: 'bi-star' },
]

const Dashboard = ({ showToast }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => showToast('Erro ao carregar dashboard.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visão Geral</h2>
      </div>
      <div className="admin-stats">
        {cards.map(({ key, label, icon }) => (
          <div className="admin-stat-card" key={key}>
            <i className={`bi ${icon} admin-stat-icon`}></i>
            <span className="admin-stat-value">{stats?.[key] ?? '—'}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default Dashboard
