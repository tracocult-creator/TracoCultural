import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import { useAuth } from '../contexts/AuthContext'
import { loginUsuario } from '../servicos/api'
import logo from '../assets/TRAÇO.png'

const Logar = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await loginUsuario(email, senha)
      login(data)
      navigate('/home')
    } catch (err) {
      setErro(err.response?.data?.message || 'Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <img src={logo} alt="Traço Cultural" className="auth-logo" />
          <div className="auth-header">
            <h2>Bem-vindo de volta</h2>
            <p>Acesse sua conta Traço Cultural</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {erro && <div className="error-message">{erro}</div>}
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <i className="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="auth-links">
            <p>Não tem uma conta? <Link to="/cadastrar" className="auth-link">Cadastre-se</Link></p>
            <Link to="/" className="back-link">← Voltar ao início</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logar
