import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import { useAuth } from '../contexts/AuthContext'
import { cadastrarUsuario } from '../servicos/api'

const Cadastrar = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

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
      const { data } = await cadastrarUsuario({ nome, email, senha })
      login(data)
      navigate('/home')
    } catch (err) {
      const status = err.response?.status
      const msg = status === 409
        ? 'Este email já está cadastrado.'
        : err.response?.data?.message || 'Erro ao criar conta. Tente novamente.'
      setErros({ geral: msg })
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
            <div className="form-group">
              <label>Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome" className={erros.nome ? 'error' : ''} />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu email" className={erros.email ? 'error' : ''} />
              {erros.email && <span className="field-error">{erros.email}</span>}
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className={erros.senha ? 'error' : ''} />
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
