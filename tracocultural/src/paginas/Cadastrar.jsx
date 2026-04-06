import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import api from '../services/api'

const Cadastrar = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validar = () => {
    const novosErros = {}
    if (!nome.trim()) novosErros.nome = 'Nome é obrigatório.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novosErros.email = 'Email inválido.'
    if (senha.length < 6) novosErros.senha = 'Senha deve ter no mínimo 6 caracteres.'
    return novosErros
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const novosErros = validar()
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }
    setErros({})
    setLoading(true)
    try {
      await api.post('/usuarios/auth/register', { nome, email, senha })
      setSucesso('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => navigate('/logar'), 1500)
    } catch (error) {
      setErros({ geral: error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Cadastrar</h2>
            <p>Crie sua conta TracoCultural</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {erros.geral && <div className="error-message">{erros.geral}</div>}
            {sucesso && <div className="error-message" style={{ backgroundColor: '#eaffea', color: '#2e7d32', borderColor: '#c8e6c9' }}>{sucesso}</div>}
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                className={erros.nome ? 'error' : ''}
                disabled={loading}
              />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className={erros.email ? 'error' : ''}
                disabled={loading}
              />
              {erros.email && <span className="field-error">{erros.email}</span>}
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={erros.senha ? 'error' : ''}
                disabled={loading}
              />
              {erros.senha && <span className="field-error">{erros.senha}</span>}
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          <div className="auth-links">
            <p>Já tem uma conta? <Link to="/logar" className="auth-link">Entrar</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cadastrar
