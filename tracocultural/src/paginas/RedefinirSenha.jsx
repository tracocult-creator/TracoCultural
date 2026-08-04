import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import '../estilos/AuthSplit.css'
import { redefinirSenha, esqueciSenha } from '../servicos/api'
import logo from '../assets/TRAÇO.png'


const TAMANHO_CODIGO = 6
const TEMPO_REENVIO = 60

const RedefinirSenha = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const emailInicial = location.state?.email || ''

  const [email, setEmail] = useState(emailInicial)
  const [digitos, setDigitos] = useState(Array(TAMANHO_CODIGO).fill(''))
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
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
    const senhaForte =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    if (!senhaForte.test(novaSenha)) {
      setErro('A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setErro('')
    setLoading(true)
    try {
      await redefinirSenha(email, codigo, novaSenha)
      setSucesso(true)
      setTimeout(() => navigate('/logar'), 1500)
    } catch (err) {
      const status = err.response?.status
      const msgBackend = err.response?.data?.message
      if (status === 400 || status === 401) {
        setErro(msgBackend || 'Código inválido ou expirado.')
      } else {
        setErro(msgBackend || 'Erro ao redefinir a senha. Tente novamente.')
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
      await esqueciSenha(email)
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
    <div className="asp-page">
      <div className="asp-painel">
        <img src={logo} alt="Traço Cultural" className="asp-painel-logo" />
        <div className="asp-painel-icone">
          <i className="bi bi-shield-lock"></i>
        </div>
        <h1>Vamos recuperar o acesso à sua conta</h1>
        <p>Confirme o código enviado por email e escolha uma nova senha para continuar explorando o Traço Cultural.</p>
      </div>

      <div className="asp-form-lado">
        <div className="asp-card">
          <div className="asp-header">
            <h2>Redefinir senha</h2>
            <p>
              {emailInicial
                ? <>Enviamos um código de 6 dígitos para <strong>{emailInicial}</strong></>
                : 'Digite seu email, o código recebido e a nova senha'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="asp-form">
            {erro && <div className="asp-error-message">{erro}</div>}
            {sucesso && <div className="asp-success-message">Senha redefinida com sucesso! Redirecionando para o login...</div>}
            {reenviado && <div className="asp-success-message">Código reenviado! Confira sua caixa de entrada.</div>}

            {!emailInicial && (
              <div className="asp-group">
                <label>Email</label>
                <div className="asp-input-wrapper">
                  <i className="bi bi-envelope asp-input-icon"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            )}

            <div className="asp-group">
              <label>Código de confirmação</label>
              <div className="asp-codigo-wrapper" onPaste={handlePaste}>
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
                    className={`asp-codigo-digito ${erro ? 'error' : ''}`}
                    disabled={loading || sucesso}
                  />
                ))}
              </div>
            </div>

            <div className="asp-campos-senha asp-campos-senha--revelado">
              <div className="asp-group">
                <label>Nova senha</label>
                <div className="asp-input-wrapper">
                  <i className="bi bi-lock asp-input-icon"></i>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Ex: Traco123@"
                    disabled={loading || sucesso}
                  />
                </div>
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
                <label>Confirmar nova senha</label>
                <div className="asp-input-wrapper">
                  <i className="bi bi-lock-fill asp-input-icon"></i>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    disabled={loading || sucesso}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="asp-btn-submit" disabled={loading || sucesso}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>

          <div className="asp-links">
            <p>
              Não recebeu o código?{' '}
              {contador > 0 ? (
                <span className="asp-resend-timer">Reenviar em {contador}s</span>
              ) : (
                <button
                  type="button"
                  className="asp-link asp-link-button"
                  onClick={handleReenviar}
                  disabled={reenviando}
                >
                  {reenviando ? 'Reenviando...' : 'Reenviar código'}
                </button>
              )}
            </p>
            <Link to="/configuracoes" className="asp-back-link">Voltar para Configurações</Link>
          </div>
        </div>
      </div>
    </div>
  )
}


export default RedefinirSenha