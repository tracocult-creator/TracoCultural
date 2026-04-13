import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      onLogout()
      navigate('/')
    }
  }

  const handleHome = () => {
    navigate('/home')
  }

  const handleFavoritos = () => {
    navigate('/favoritos')
  }

  const handlePerfil = () => {
    navigate('/perfil')
  }

  const handleConfiguracoes = () => {
    navigate('/configuracoes')
  }

  const handleCriarEvento = () => {
    navigate('/CriarEvento')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img src="src/assets/TRAÇO.png" alt="TraçoCultural" className="navbar-logo" />
      </div>
      <nav className="navbar-nav">
        <button className="nav-button" onClick={handleHome}><i className="bi bi-house"></i> Home</button>
        <button className="nav-button" onClick={handleFavoritos}><i className="bi bi-heart"></i> Favoritos</button>
        <button className="nav-button" onClick={handlePerfil}><i className="bi bi-person"></i> Meu Perfil</button>
        <button className="nav-button" onClick={handleConfiguracoes}><i className="bi bi-gear"></i> Configurações</button>
        <button className="nav-button" onClick={handleCriarEvento}><i className="bi bi-plus"></i> Criar Evento</button>
        <button className="nav-button" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Sair</button>
      </nav>
    </header>
  )
}

export default Navbar