import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import '../estilos/SettingsPage.css'
import { useAuth } from '../contexts/AuthContext'
import { deletarUsuario } from '../servicos/api'

const Configuracoes = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    emailMarketing: user?.emailMarketing ?? false,
    localizacao: user?.localizacao ?? true,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroDelete, setErroDelete] = useState('')

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'EXCLUIR') return
    setErroDelete('')
    setLoading(true)
    try {
      await deletarUsuario(user.id)
      logout()
      navigate('/', { state: { mensagem: 'Sua conta foi encerrada.' } })
    } catch (err) {
      setErroDelete(err.response?.data?.message || 'Erro ao excluir conta. Tente novamente.')
      setLoading(false)
    }
  }

  const openDeleteModal = () => {
    setConfirmText('')
    setErroDelete('')
    setShowDeleteModal(true)
  }

  return (
    <div className="settings-page">
      <Navbar />

      <section className="title-section">
        <span className="page-eyebrow">
          <i className="bi bi-gear"></i> Preferências
        </span>
        <h2 className="main-title">Configurações</h2>
        <p className="page-subtitle">Ajuste notificações, privacidade e acesso da sua conta.</p>
      </section>

      <main className="settings-content">
        <div className="settings-card">

          {/* Notificações */}
          <div className="settings-section">
            <div className="section-header">
              <i className="bi bi-bell"></i>
              <h3 className="section-title">Notificações</h3>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Email marketing</span>
                <span className="setting-desc">Receber novidades e recomendações por email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailMarketing}
                  onChange={() => handleToggle('emailMarketing')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Privacidade */}
          <div className="settings-section">
            <div className="section-header">
              <i className="bi bi-shield-check"></i>
              <h3 className="section-title">Privacidade</h3>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Compartilhar localização</span>
                <span className="setting-desc">Permitir sugestões baseadas na sua localização</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.localizacao}
                  onChange={() => handleToggle('localizacao')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Sobre */}
          <div className="settings-section">
            <div className="section-header">
              <i className="bi bi-info-circle"></i>
              <h3 className="section-title">Sobre</h3>
            </div>
            <div className="about-item">
              <span className="about-label">Termos de uso</span>
              <button className="link-button">
                Ver termos <i className="bi bi-arrow-up-right"></i>
              </button>
            </div>
            <div className="about-item">
              <span className="about-label">Política de privacidade</span>
              <button className="link-button">
                Ver política <i className="bi bi-arrow-up-right"></i>
              </button>
            </div>
          </div>

          {/* Zona de perigo */}
          <div className="settings-section danger-section">
            <div className="section-header">
              <i className="bi bi-exclamation-triangle"></i>
              <h3 className="section-title">Zona de perigo</h3>
            </div>
            <div className="danger-buttons">
              <button className="btn-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right"></i> Sair da conta
              </button>
              <button className="btn-danger" onClick={openDeleteModal}>
                <i className="bi bi-trash3"></i> Excluir conta permanentemente
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Modal excluir conta */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <i className="bi bi-trash3"></i>
            </div>
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
            {erroDelete && (
              <p className="delete-erro">
                <i className="bi bi-exclamation-circle"></i> {erroDelete}
              </p>
            )}
            <div className="delete-modal-actions">
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== 'EXCLUIR'}
              >
                {loading ? 'Excluindo…' : 'Confirmar exclusão'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Configuracoes