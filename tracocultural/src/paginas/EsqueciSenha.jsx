import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import { esqueciSenha } from '../servicos/api'
import logo from '../assets/TRAÇO.png'

const EsqueciSenha = () => {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setErro('Informe seu email.')
      return
    }

    setErro('')
    setLoading(true)
    try {
      await esqueciSenha(email)
      navigate('/redefinir-senha', { state: { email } })
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao solicitar redefinição. Tente novamente.')
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
            <h2>Esqueceu sua senha?</h2>
            <p>Digite seu email e enviaremos um código para redefinir sua senha</p>
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
                  className={erro ? 'error' : ''}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Lembrou a senha? <Link to="/logar" className="auth-link">Entrar</Link>
            </p>
            <Link to="/" className="back-link">← Voltar ao início</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EsqueciSenha