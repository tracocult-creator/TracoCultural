import React, { useEffect, useState } from 'react'
import api from '../../servicos/api'

const cards = [
  { key: 'totalUsuarios',     label: 'Usuários',           icon: 'bi-people' },
  { key: 'totalAdmins',       label: 'Administradores',    icon: 'bi-shield-check' },
  { key: 'totalEventos',      label: 'Eventos',            icon: 'bi-calendar-event' },
  { key: 'totalComentarios',  label: 'Comentários',        icon: 'bi-chat-dots' },
  { key: 'eventosDestacados', label: 'Destaques',          icon: 'bi-star' },
]

const acoesRapidas = [
  { aba: 'notificacoes', label: 'Enviar notificação', icon: 'bi-megaphone', desc: 'Avise todos os usuários' },
  { aba: 'eventos',      label: 'Gerenciar eventos',  icon: 'bi-calendar-event', desc: 'Editar, destacar ou excluir' },
  { aba: 'usuarios',     label: 'Gerenciar usuários',  icon: 'bi-people', desc: 'Promover admins, excluir contas' },
  { aba: 'comentarios',  label: 'Moderar comentários',  icon: 'bi-chat-dots', desc: 'Revisar e remover conteúdo' },
]

const Dashboard = ({ showToast, onNavigate }) => {
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

      <div className="admin-section-header" style={{ marginTop: '.5rem' }}>
        <h2 className="admin-section-title">Ações rápidas</h2>
      </div>
      <div className="admin-quick-actions">
        {acoesRapidas.map((a) => (
          <button
            key={a.aba}
            className="admin-quick-action"
            onClick={() => onNavigate?.(a.aba)}
          >
            <span className="admin-quick-action-icon"><i className={`bi ${a.icon}`}></i></span>
            <span className="admin-quick-action-text">
              <strong>{a.label}</strong>
              <small>{a.desc}</small>
            </span>
            <i className="bi bi-chevron-right admin-quick-action-arrow"></i>
          </button>
        ))}
      </div>
    </>
  )
}

export default Dashboard