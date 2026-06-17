import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import { useAuth } from '../contexts/AuthContext'
import { loginUsuario } from '../servicos/api'
import logo from '../assets/TRAÇO.png'

const Logar = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const validar = () => {
    const novosErros = {}
    if (!email.trim()) novosErros.email = 'Email é obrigatório.'
    if (!senha) novosErros.senha = 'Senha é obrigatória.'
    return novosErros
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const novosErros = validar()
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return }
    setErros({})
    setLoading(true)
    try {
      const { data } = await loginUsuario(email, senha)
      login(data)
      navigate('/home')
    } catch (err) {
      const status = err.response?.status
      const msg = status === 429
        ? 'Muitas tentativas de login. Aguarde alguns minutos.'
        : err.response?.data?.message || 'Email ou senha incorretos.'
      setErros({ geral: msg })
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
            {erros.geral && <div className="error-message">{erros.geral}</div>}
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <i className="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={erros.email ? 'error' : ''}
                  disabled={loading}
                />
              </div>
              {erros.email && <span className="field-error">{erros.email}</span>}
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={erros.senha ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi bi-${mostrarSenha ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {erros.senha && <span className="field-error">{erros.senha}</span>}
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
