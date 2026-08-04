import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../estilos/AuthSplit.css'
import { cadastrarUsuario } from '../servicos/api'
import logo from '../assets/TRAÇO.png'

const Cadastrar = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const navigate = useNavigate()

  const validar = () => {
    const novosErros = {}

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido.'
    }

    const senhaForte =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

    if (!senhaForte.test(senha)) {
      novosErros.senha =
        'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.'
    }

    if (senha !== confirmarSenha) {
      novosErros.confirmarSenha =
        'As senhas não coincidem.'
    }

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
      await cadastrarUsuario({
        nome,
        email,
        senha
      })

      setSucesso(true)
      navigate('/verificar-codigo', { state: { email } })

    } catch (err) {

      const status = err.response?.status
      const msgBackend = err.response?.data?.message

      if (status === 409) {
        setErros({
          email: 'Este email já está cadastrado.'
        })
      } else if (
        status === 400 &&
        msgBackend?.toLowerCase().includes('domínio')
      ) {
        setErros({
          email: 'Esse domínio de email não existe. Confira se digitou corretamente.'
        })
      } else {
        setErros({
          geral: msgBackend || 'Erro ao criar conta. Tente novamente.'
        })
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="asp-page">
      <div className="asp-painel">
        <img src={logo} alt="Traço Cultural" className="asp-painel-logo" />
        <div className="asp-painel-icone">
        </div>
        <h1>Faça parte do Traço Cultural</h1>
        <p>Crie sua conta para descobrir, salvar e participar de eventos culturais na sua cidade.</p>
      </div>

      <div className="asp-form-lado">
        <div className="asp-card">
          <div className="asp-header">
            <h2>Criar conta</h2>
            <p>Junte-se ao Traço Cultural</p>
          </div>

          <form onSubmit={handleSubmit} className="asp-form">
            {erros.geral && (
              <div className="asp-error-message">
                {erros.geral}
              </div>
            )}

            <div className="asp-group">
              <label>Nome</label>
              <div className="asp-input-wrapper">
                <i className="bi bi-person asp-input-icon"></i>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className={erros.nome ? 'error' : ''}
                  disabled={loading || sucesso}
                />
              </div>
              {erros.nome && (
                <span className="asp-field-error">{erros.nome}</span>
              )}
            </div>

            <div className="asp-group">
              <label>Email</label>
              <div className="asp-input-wrapper">
                <i className="bi bi-envelope asp-input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={erros.email ? 'error' : ''}
                  disabled={loading || sucesso}
                />
              </div>
              {erros.email && (
                <span className="asp-field-error">{erros.email}</span>
              )}
            </div>

            <div className="asp-group">
              <label>Senha</label>
              <div className="asp-input-wrapper">
                <i className="bi bi-lock asp-input-icon"></i>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Ex: Traco123@"
                  className={erros.senha ? 'error' : ''}
                  disabled={loading || sucesso}
                />
                <button
                  type="button"
                  className="asp-toggle-senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi bi-${mostrarSenha ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {erros.senha && (
                <span className="asp-field-error">{erros.senha}</span>
              )}
              <p className="asp-senha-requisito">
                A senha deve conter:
                <br />
                • mínimo 8 caracteres
                <br />
                • uma letra maiúscula
                <br />
                • uma letra minúscula
                <br />
                • um número
                <br />
                • um caractere especial (@, $, !, %, *, ?, &)
              </p>
            </div>

            <div className="asp-group">
              <label>Confirmar senha</label>
              <div className="asp-input-wrapper">
                <i className="bi bi-lock-fill asp-input-icon"></i>
                <input
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className={erros.confirmarSenha ? 'error' : ''}
                  disabled={loading || sucesso}
                />
                <button
                  type="button"
                  className="asp-toggle-senha"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi bi-${mostrarConfirmarSenha ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {erros.confirmarSenha && (
                <span className="asp-field-error">{erros.confirmarSenha}</span>
              )}
            </div>

            {sucesso && (
              <div className="asp-success-message">
                Cadastro realizado! Verifique seu email para ativar sua conta.
              </div>
            )}

            <button
              type="submit"
              className="asp-btn-submit"
              disabled={loading || sucesso}
            >
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <div className="asp-links">
            <p>
              Já tem uma conta? <Link to="/logar" className="asp-link">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cadastrar