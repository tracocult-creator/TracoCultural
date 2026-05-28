import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/TRAÇO.png'
import '../estilos/WelcomePage.css'

const WelcomePage = () => {
  const { user } = useAuth()
  if (user) return <Navigate to="/home" replace />

  return (
    <div className="welcome-page">
      <div className="welcome-noise" />

      <nav className="welcome-nav">
        <img src={logo} alt="Traço Cultural" className="welcome-nav-logo" />
      </nav>

      <main className="welcome-hero">
        <div className="welcome-badge">
          <i className="bi bi-compass"></i>
          DESCUBRA O QUE HÁ POR PERTO
        </div>

        <h1 className="welcome-title">
          Para onde nós<br />vamos <span className="welcome-title-highlight">hoje?</span>
        </h1>

        <p className="welcome-subtitle">
          Encontre eventos culturais, shows, feiras e experiências únicas perto de você.
        </p>

        <div className="welcome-buttons">
          <Link to="/logar" className="btn-welcome-primary">
            <i className="bi bi-arrow-right-circle"></i>
            Entrar
          </Link>
          <Link to="/cadastrar" className="btn-welcome-secondary">
            Criar conta grátis
          </Link>
        </div>
      </main>

      <footer className="welcome-stats">
        <div className="stat-item">
          <span className="stat-number">500+</span>
          <span className="stat-label">Eventos</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">27</span>
          <span className="stat-label">Estados</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Usuários</span>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage
