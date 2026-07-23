import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/TRAÇO.png'
import '../estilos/Modal.css'

const Navbar = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

  const confirmarLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
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
        <button className="nav-button" onClick={() => navigate('/perfil')}>
          <i className="bi bi-person"></i> Meu Perfil
        </button>
        <button className="nav-button" onClick={() => navigate('/configuracoes')}>
          <i className="bi bi-gear"></i> Configuracoes
        </button>
        <button className="nav-button nav-button--criar" onClick={() => navigate('/criar-evento')}>
          <i className="bi bi-plus-circle"></i> Criar Evento
        </button>
        {user?.isAdm && (
          <button className="nav-button" style={{ color: '#d4a373', borderColor: 'rgba(212,163,115,.3)' }} onClick={() => navigate('/admin')}>
            <i className="bi bi-shield-check"></i> Admin
          </button>
        )}
        <button className="nav-button" onClick={() => setMostrarConfirmacao(true)}>
          <i className="bi bi-box-arrow-right"></i> Sair
        </button>
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