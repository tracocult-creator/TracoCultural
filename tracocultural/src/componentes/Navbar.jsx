import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/TRAÇO.png'

const Navbar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout()
      navigate('/')
    }
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
        <button className="nav-button" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Sair
        </button>
      </nav>
    </header>
  )
}

export default Navbar
