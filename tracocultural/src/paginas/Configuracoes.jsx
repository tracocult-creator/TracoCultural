import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import '../estilos/temaClaro.css'
import '../estilos/Modal.css' // .modal-overlay
import '../estilos/SettingsPage.css' // reaproveitado só para o modal de exclusão de conta (.delete-modal...)
import { useAuth } from '../contexts/AuthContext'
import api, { deletarUsuario, esqueciSenha } from '../servicos/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const iniciais = (nome) => (nome || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

const Configuracoes = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [aba, setAba] = useState('conta')

  // Conta
  const [dados, setDados] = useState({ nome: user?.nome || '', email: user?.email || '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)

  // Preferências / notificações
  const [settings, setSettings] = useState({
    emailMarketing: user?.emailMarketing ?? false,
    localizacao: user?.localizacao ?? true,
  })
  const handleToggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  // Exclusão de conta
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [erroDelete, setErroDelete] = useState('')
  const [deletando, setDeletando] = useState(false)

  // Redefinir senha
  const [enviandoCodigo, setEnviandoCodigo] = useState(false)

  const handleRedefinirSenha = async () => {
    if (!user?.email) return
    setErro('')
    setEnviandoCodigo(true)
    try {
      await esqueciSenha(user.email)
      navigate('/redefinir-senha', { state: { email: user.email } })
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao enviar o código de redefinição. Tente novamente.')
    } finally {
      setEnviandoCodigo(false)
    }
  }

  const handleSalvar = async () => {
    setErro('')
    if (!dados.nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (!EMAIL_RE.test(dados.email)) { setErro('Email inválido.'); return }
    setLoading(true)
    try {
      const { data } = await api.put(`/usuarios/${user.id}`, { nome: dados.nome, email: dados.email })
      login(data)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar alterações.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'EXCLUIR') return
    setErroDelete('')
    setDeletando(true)
    try {
      await deletarUsuario(user.id)
      logout()
      navigate('/', { state: { mensagem: 'Sua conta foi encerrada.' } })
    } catch (err) {
      setErroDelete(err.response?.data?.message || 'Erro ao excluir conta. Tente novamente.')
      setDeletando(false)
    }
  }

  const navItems = [
    { key: 'conta', icon: 'bi-person', label: 'Conta', desc: 'Informações pessoais' },
    { key: 'preferencias', icon: 'bi-sliders', label: 'Preferências', desc: 'Suas preferências de conteúdo' },
    { key: 'notificacoes', icon: 'bi-bell', label: 'Notificações', desc: 'Gerencie seus alertas' },
  ]

  return (
    <div className="tc-app">
      <Navbar />

      <div className="tc-page-head">
        <i className="bi bi-gear-fill tc-page-head-watermark"></i>
        <div className="tc-page-head-inner">
          <h1 className="tc-page-title">Configurações</h1>
          <p className="tc-page-sub">Gerencie suas preferências e informações da conta.</p>
        </div>
      </div>

      <div className="tc-settings-layout">
        <nav className="tc-settings-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`tc-settings-nav-item${aba === item.key ? ' tc-settings-nav-item--active' : ''}`}
              onClick={() => setAba(item.key)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}<small>{item.desc}</small></span>
            </button>
          ))}
          <button className="tc-settings-nav-item" onClick={logout} style={{ color: '#b3413a' }} data-logout>
            <i className="bi bi-box-arrow-right"></i>
            <span>Sair da conta</span>
          </button>
        </nav>

        <div>
          {aba === 'conta' && (
            <>
              <div className="tc-card">
                <div className="tc-card-head">
                  <span className="tc-card-head-icon"><i className="bi bi-person"></i></span>
                  <h3>Informações pessoais</h3>
                </div>

                <div className="tc-settings-identity">
                  <span className="tc-settings-identity-avatar" style={{ background: user?.corFundo || 'var(--tc-primary-dark)' }}>
                    {iniciais(user?.nome)}
                  </span>
                  <div>
                    <div className="tc-settings-identity-name">{user?.nome || 'Sua conta'}</div>
                    <div className="tc-settings-identity-email">{user?.email}</div>
                  </div>
                </div>

                {sucesso && <div className="tc-success-bar">Alterações salvas com sucesso!</div>}
                {erro && <p style={{ color: '#b3413a', fontSize: '.85rem', marginBottom: '.6rem' }}>{erro}</p>}

                <div className="tc-form-grid">
                  <div className="tc-form-field">
                    <label>Nome completo</label>
                    <input type="text" value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
                  </div>
                  <div className="tc-form-field">
                    <label>E-mail</label>
                    <input type="email" value={dados.email} onChange={(e) => setDados({ ...dados, email: e.target.value })} />
                  </div>
                </div>

                <button className="tc-btn-primary" style={{ marginTop: '1.2rem' }} onClick={handleSalvar} disabled={loading}>
                  {loading ? 'Salvando…' : 'Salvar alterações'}
                </button>
              </div>

              <div className="tc-card">
                <div className="tc-card-head">
                  <span className="tc-card-head-icon"><i className="bi bi-shield-lock"></i></span>
                  <h3>Senha</h3>
                </div>
                <p style={{ marginBottom: '1rem' }}>Enviaremos um código de confirmação para o seu e-mail antes de definir uma nova senha.</p>
                <button
                  type="button"
                  className="tc-btn-secondary"
                  onClick={handleRedefinirSenha}
                  disabled={enviandoCodigo}
                >
                  {enviandoCodigo ? 'Enviando código…' : 'Redefinir senha'}
                </button>
              </div>

              <div className="tc-card tc-card--danger">
                <div className="tc-card-head">
                  <span className="tc-card-head-icon"><i className="bi bi-exclamation-triangle"></i></span>
                  <h3>Zona de risco</h3>
                </div>
                <div className="tc-danger-box">
                  <strong>Excluir conta</strong>
                  <p>Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
                  <button className="tc-btn-danger" onClick={() => { setConfirmText(''); setErroDelete(''); setShowDeleteModal(true) }}>
                    Excluir conta
                  </button>
                </div>
              </div>
            </>
          )}

          {aba === 'preferencias' && (
            <div className="tc-card">
              <div className="tc-card-head">
                <span className="tc-card-head-icon"><i className="bi bi-sliders"></i></span>
                <h3>Preferências</h3>
              </div>
              <div className="tc-toggle-row">
                <div className="tc-toggle-row-label">
                  <strong>Compartilhar localização</strong>
                  <span>Permitir sugestões de eventos baseadas na sua localização</span>
                </div>
                <label className="tc-switch">
                  <input type="checkbox" checked={settings.localizacao} onChange={() => handleToggle('localizacao')} />
                  <span className="tc-switch-slider"></span>
                </label>
              </div>
            </div>
          )}

          {aba === 'notificacoes' && (
            <div className="tc-card">
              <div className="tc-card-head">
                <span className="tc-card-head-icon"><i className="bi bi-bell"></i></span>
                <h3>Notificações</h3>
              </div>
              <div className="tc-toggle-row">
                <div className="tc-toggle-row-label">
                  <strong>Email marketing</strong>
                  <span>Receber novidades e recomendações por email</span>
                </div>
                <label className="tc-switch">
                  <input type="checkbox" checked={settings.emailMarketing} onChange={() => handleToggle('emailMarketing')} />
                  <span className="tc-switch-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon"><i className="bi bi-trash3"></i></div>
            <h3>Excluir conta</h3>
            <p>
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão apagados.
              Digite <strong>EXCLUIR</strong> abaixo para confirmar.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="EXCLUIR"
              className="delete-confirm-input"
              autoFocus
            />
            {erroDelete && <p className="delete-erro"><i className="bi bi-exclamation-circle"></i> {erroDelete}</p>}
            <div className="delete-modal-actions">
              <button className="btn-confirm-delete" onClick={handleDeleteAccount} disabled={deletando || confirmText !== 'EXCLUIR'}>
                {deletando ? 'Excluindo…' : 'Confirmar exclusão'}
              </button>
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={deletando}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Configuracoes