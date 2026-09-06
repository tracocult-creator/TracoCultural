import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SidebarAdmin from '../componentes/admin/SidebarAdmin'
import Dashboard from '../componentes/admin/Dashboard'
import EventosAdmin from '../componentes/admin/EventosAdmin'
import ComentariosAdmin from '../componentes/admin/ComentariosAdmin'
import UsuariosAdmin from '../componentes/admin/UsuariosAdmin'
import NotificacoesAdmin from '../componentes/admin/NotificacoesAdmin'
import '../estilos/admin.css'

const titulos = {
  dashboard:     'Dashboard',
  eventos:       'Eventos',
  comentarios:   'Comentários',
  usuarios:      'Usuários',
  notificacoes:  'Notificações',
}

const Admin = () => {
  const { user } = useAuth()
  const [aba, setAba] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const renderConteudo = () => {
    switch (aba) {
      case 'dashboard':     return <Dashboard showToast={showToast} onNavigate={setAba} />
      case 'eventos':       return <EventosAdmin showToast={showToast} />
      case 'comentarios':   return <ComentariosAdmin showToast={showToast} />
      case 'usuarios':      return <UsuariosAdmin showToast={showToast} />
      case 'notificacoes':  return <NotificacoesAdmin showToast={showToast} />
      default:              return null
    }
  }

  return (
    <div className="admin-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SidebarAdmin
        aba={aba}
        setAba={setAba}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen((v) => !v)}>
              <i className="bi bi-list"></i>
            </button>
            <h1 className="admin-topbar-title">{titulos[aba]}</h1>
          </div>
          <span className="admin-topbar-user">
            <i className="bi bi-shield-check"></i>
            {user?.nome}
          </span>
        </div>

        <div className="admin-content">
          {renderConteudo()}
        </div>
      </div>

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default Admin