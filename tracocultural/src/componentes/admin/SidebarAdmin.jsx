import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/TRAÇO.png'

const itens = [
  { key: 'dashboard',   label: 'Dashboard',   icon: 'bi-speedometer2' },
  { key: 'eventos',     label: 'Eventos',      icon: 'bi-calendar-event' },
  { key: 'comentarios', label: 'Comentários',  icon: 'bi-chat-dots' },
  { key: 'usuarios',    label: 'Usuários',     icon: 'bi-people' },
]

const SidebarAdmin = ({ aba, setAba, isOpen, onClose }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}>
      <div className="admin-sidebar-logo">
        <img src={logo} alt="Traço Cultural" />
      </div>

      <span className="admin-sidebar-label">Menu</span>

      <nav className="admin-nav">
        {itens.map((item) => (
          <button
            key={item.key}
            className={`admin-nav-item ${aba === item.key ? 'admin-nav-item--active' : ''}`}
            onClick={() => { setAba(item.key); onClose?.() }}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-nav-item" onClick={() => navigate('/home')}>
          <i className="bi bi-arrow-left"></i> Voltar ao site
        </button>
        <button className="admin-nav-item" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Sair
        </button>
      </div>
    </aside>
  )
}

export default SidebarAdmin
