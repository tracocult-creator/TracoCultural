import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/TRAÇO.png'
import '../estilos/Modal.css'
import '../estilos/temaClaro.css'

const Navbar = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickFora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  const confirmarLogout = () => {
    logout()
    navigate('/')
  }

  const irPara = (rota) => {
    setMenuAberto(false)
    navigate(rota)
  }

  const iniciais = (user?.nome || user?.name || 'U').trim().charAt(0).toUpperCase()

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/home')}>
        <img src={logo} alt="TracoCultural" className="navbar-logo" />
      </div>

      <nav className="navbar-nav">
        <button className="nav-button" onClick={() => navigate('/home')}>
          <i className="bi bi-house"></i> Home
        </button>
        <button className="nav-button" onClick={() => navigate('/mapa')}>
          <i className="bi bi-geo-alt"></i> Mapa
        </button>
        <button className="nav-button" onClick={() => navigate('/favoritos')}>
          <i className="bi bi-heart"></i> Favoritos
        </button>
        <button className="nav-button nav-button--criar" onClick={() => navigate('/criar-evento')}>
          <i className="bi bi-plus-circle"></i> Criar Evento
        </button>

        <div className="navbar-user" ref={menuRef}>
          <button
            className="navbar-user-trigger"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-label="Menu do usuário"
          >
            <span className="navbar-user-avatar">{iniciais}</span>
            <i className={`bi bi-chevron-down navbar-user-chevron${menuAberto ? ' navbar-user-chevron--open' : ''}`}></i>
          </button>

          {menuAberto && (
            <div className="navbar-user-menu">
              <button className="navbar-user-menu-item" onClick={() => irPara('/perfil')}>
                <i className="bi bi-person"></i> Meu Perfil
              </button>
              <button className="navbar-user-menu-item" onClick={() => irPara('/configuracoes')}>
                <i className="bi bi-gear"></i> Configurações
              </button>
              {user?.isAdm && (
                <button className="navbar-user-menu-item navbar-user-menu-item--admin" onClick={() => irPara('/admin')}>
                  <i className="bi bi-shield-check"></i> Admin
                </button>
              )}
              <div className="navbar-user-menu-divider" />
              <button
                className="navbar-user-menu-item navbar-user-menu-item--danger"
                onClick={() => { setMenuAberto(false); setMostrarConfirmacao(true) }}
              >
                <i className="bi bi-box-arrow-right"></i> Sair
              </button>
            </div>
          )}
        </div>
      </nav>

      {mostrarConfirmacao && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacao(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sair da conta</h3>
            <p style={{ padding: '0.75rem 1.5rem 0', color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
              Tem certeza que deseja sair?
            </p>
            <div className="modal-actions">
              <button onClick={confirmarLogout}>Sair</button>
              <button onClick={() => setMostrarConfirmacao(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar