import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import '../estilos/AuthPages.css'
import { verificarCodigo, reenviarCodigo } from '../servicos/api'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/TRAÇO.png'

const TAMANHO_CODIGO = 6
const TEMPO_REENVIO = 60 // segundos

const VerificarCodigo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  // Email vem da tela de cadastro (navigate com state). Se não vier, permite digitar.
  const emailInicial = location.state?.email || ''
  const dadosLogin = location.state?.dadosLogin || null

  const [email, setEmail] = useState(emailInicial)
  const [digitos, setDigitos] = useState(Array(TAMANHO_CODIGO).fill(''))
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  const [contador, setContador] = useState(TEMPO_REENVIO)

  const inputsRef = useRef([])

  useEffect(() => {
    if (contador <= 0) return
    const timer = setTimeout(() => setContador((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [contador])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const focarIndice = (i) => {
    inputsRef.current[i]?.focus()
    inputsRef.current[i]?.select()
  }

  const handleChange = (i, valor) => {
    const v = valor.replace(/\D/g, '')
    if (!v) {
      const novos = [...digitos]
      novos[i] = ''
      setDigitos(novos)
      return
    }
    const novos = [...digitos]
    novos[i] = v[v.length - 1]
    setDigitos(novos)
    if (i < TAMANHO_CODIGO - 1) focarIndice(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digitos[i]) {
        const novos = [...digitos]
        novos[i] = ''
        setDigitos(novos)
      } else if (i > 0) {
        focarIndice(i - 1)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focarIndice(i - 1)
    } else if (e.key === 'ArrowRight' && i < TAMANHO_CODIGO - 1) {
      focarIndice(i + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TAMANHO_CODIGO)
    if (!colado) return
    const novos = Array(TAMANHO_CODIGO).fill('')
    colado.split('').forEach((c, idx) => { novos[idx] = c })
    setDigitos(novos)
    focarIndice(Math.min(colado.length, TAMANHO_CODIGO - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const codigo = digitos.join('')

    if (!email.trim()) {
      setErro('Informe o email cadastrado.')
      return
    }
    if (codigo.length < TAMANHO_CODIGO) {
      setErro('Digite o código completo de 6 dígitos.')
      return
    }

    setErro('')
    setLoading(true)
    try {
      const { data } = await verificarCodigo(email, codigo)
      setSucesso(true)
      // Usa os dados do login já feitos no cadastro, se houver, senão os retornados aqui
      if (dadosLogin) login(dadosLogin)
      else if (data) login(data)
      setTimeout(() => navigate('/home'), 1200)
    } catch (err) {
      const status = err.response?.status
      const msgBackend = err.response?.data?.message
      if (status === 400 || status === 401) {
        setErro(msgBackend || 'Código inválido ou expirado.')
      } else {
        setErro(msgBackend || 'Erro ao verificar o código. Tente novamente.')
      }
      setDigitos(Array(TAMANHO_CODIGO).fill(''))
      focarIndice(0)
    } finally {
      setLoading(false)
    }
  }

  const handleReenviar = async () => {
    if (!email.trim()) {
      setErro('Informe o email cadastrado para reenviar o código.')
      return
    }
    setErro('')
    setReenviando(true)
    try {
      await reenviarCodigo(email)
      setReenviado(true)
      setContador(TEMPO_REENVIO)
      setDigitos(Array(TAMANHO_CODIGO).fill(''))
      focarIndice(0)
      setTimeout(() => setReenviado(false), 4000)
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível reenviar o código.')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <img src={logo} alt="Traço Cultural" className="auth-logo" />
          <div className="auth-header">
            <h2>Confirme seu email</h2>
            <p>
              {emailInicial
                ? <>Enviamos um código de 6 dígitos para <strong>{emailInicial}</strong></>
                : 'Digite seu email e o código de 6 dígitos que enviamos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {erro && <div className="error-message">{erro}</div>}
            {sucesso && <div className="success-message">Email confirmado com sucesso!</div>}
            {reenviado && <div className="success-message">Código reenviado! Confira sua caixa de entrada.</div>}

            {!emailInicial && (
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <i className="bi bi-envelope input-icon"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Código de confirmação</label>
              <div className="codigo-wrapper" onPaste={handlePaste}>
                {digitos.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`codigo-digito ${erro ? 'error' : ''}`}
                    disabled={loading || sucesso}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading || sucesso}>
              {loading ? 'Verificando...' : 'Confirmar código'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Não recebeu o código?{' '}
              {contador > 0 ? (
                <span className="resend-timer">Reenviar em {contador}s</span>
              ) : (
                <button
                  type="button"
                  className="auth-link link-button"
                  onClick={handleReenviar}
                  disabled={reenviando}
                >
                  {reenviando ? 'Reenviando...' : 'Reenviar código'}
                </button>
              )}
            </p>
            <Link to="/logar" className="back-link">Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificarCodigo