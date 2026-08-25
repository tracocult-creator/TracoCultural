import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import '../estilos/AuthSplit.css'
import { redefinirSenha, esqueciSenha, VerificarCodigo } from '../servicos/api'
import logo from '../assets/TRAÇO.png'


const TAMANHO_CODIGO = 6
const TEMPO_REENVIO = 60

const RedefinirSenha = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const emailInicial = location.state?.email || ''

  const [email, setEmail] = useState(emailInicial)
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  const [contador, setContador] = useState(TEMPO_REENVIO)

  // codigoConfirmado: null = ainda não verificado, true = válido, false = inválido
  const [verificando, setVerificando] = useState(false)
  const [codigoConfirmado, setCodigoConfirmado] = useState(null)

  const inputRef = useRef(null)

  useEffect(() => {
    if (contador <= 0) return
    const timer = setTimeout(() => setContador((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [contador])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const digitos = codigo.padEnd(TAMANHO_CODIGO, ' ').split('')

  const handleCodigoChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, TAMANHO_CODIGO)
    setCodigo(v)
    // qualquer edição no código invalida a confirmação anterior
    if (codigoConfirmado !== null) setCodigoConfirmado(null)
  }

  const handleVerificarCodigo = async () => {
    if (codigo.length < TAMANHO_CODIGO) {
      setErro('Digite o código completo de 6 dígitos.')
      return
    }
    if (!email.trim()) {
      setErro('Informe o email cadastrado.')
      return
    }
    setErro('')
    setVerificando(true)
    try {
      const { data } = await VerificarCodigo(email, codigo)
      if (data?.valido) {
        setCodigoConfirmado(true)
      } else {
        setCodigoConfirmado(false)
        setErro('Código incorreto ou expirado.')
      }
    } catch (err) {
      setCodigoConfirmado(false)
      setErro(err.response?.data?.message || 'Não foi possível verificar o código agora.')
    } finally {
      setVerificando(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setErro('Informe o email cadastrado.')
      return
    }
    if (codigo.length < TAMANHO_CODIGO) {
      setErro('Digite o código completo de 6 dígitos.')
      return
    }
    if (codigoConfirmado !== true) {
      setErro('Verifique o código antes de continuar.')
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
      setCodigo('')
      setCodigoConfirmado(null)
      inputRef.current?.focus()
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
      setCodigo('')
      setCodigoConfirmado(null)
      inputRef.current?.focus()
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

              {/* Input real: fica por cima das caixinhas, mas invisível.
                  As caixinhas abaixo só exibem o valor - garante que o dígito
                  sempre aparece, sem depender de 6 inputs controlados separados. */}
              <div className="asp-codigo-shell">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={TAMANHO_CODIGO}
                  value={codigo}
                  onChange={handleCodigoChange}
                  disabled={loading || sucesso}
                  className="asp-codigo-input-real"
                />
                <div className="asp-codigo-wrapper" aria-hidden="true">
                  {digitos.map((d, i) => (
                    <div
                      key={i}
                      className={`asp-codigo-digito ${erro && codigoConfirmado === false ? 'error' : ''} ${i === codigo.length ? 'asp-codigo-digito--ativo' : ''}`}
                    >
                      {d.trim()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="asp-codigo-acoes">
                <button
                  type="button"
                  className="asp-link asp-link-button"
                  onClick={handleVerificarCodigo}
                  disabled={verificando || loading || sucesso || codigo.length < TAMANHO_CODIGO}
                >
                  {verificando ? 'Verificando...' : 'Verificar código'}
                </button>
                {codigoConfirmado === true && (
                  <span className="asp-codigo-status asp-codigo-status--valido">✓ Código confirmado</span>
                )}
              </div>
            </div>

            <div
              className={`asp-campos-senha ${codigoConfirmado === true ? 'asp-campos-senha--revelado' : ''}`}
              aria-hidden={codigoConfirmado !== true}
            >
              <div className="asp-group">
                <label>Nova senha</label>
                <div className="asp-input-wrapper">
                  <i className="bi bi-lock asp-input-icon"></i>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Ex: Traco123@"
                    disabled={loading || sucesso || codigoConfirmado !== true}
                    tabIndex={codigoConfirmado === true ? 0 : -1}
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
                    disabled={loading || sucesso || codigoConfirmado !== true}
                    tabIndex={codigoConfirmado === true ? 0 : -1}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="asp-btn-submit" disabled={loading || sucesso || codigoConfirmado !== true}>
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