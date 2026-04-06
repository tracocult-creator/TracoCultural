import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

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
      const response = await api.post('/auth/login', { email, senha })
      login(response.data)
      navigate('/home')
    } catch (error) {
      setErro(
        error.response?.status === 401
          ? 'Email ou senha incorretos.'
          : 'Erro ao conectar. Tente novamente mais tarde.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Entrar</h2>
            <p>Acesse sua conta TracoCultural</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {erro && <div className="error-message">{erro}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={loading}
              />
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
