import React, { useState } from 'react'
import Navbar from '../componentes/Navbar'
import '../estilos/SettingsPage.css'
import { useAuth } from '../contexts/AuthContext'

const Configuracoes = () => {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState({
    emailMarketing: user?.emailMarketing ?? false,
    localizacao: user?.localizacao ?? true,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDeleteAccount = () => {
    if (confirmText !== 'EXCLUIR') return
    setLoading(true)
    logout()
  }

  const openDeleteModal = () => {
    setConfirmText('')
    setShowDeleteModal(true)
  }

  return (
    <div className="settings-page">
      <Navbar />

      <section className="title-section">
        <h2 className="main-title">Configurações</h2>
      </section>

      <main className="settings-content">
        <div className="settings-card">
          {/* Notificações */}
          <div className="settings-section">
            <h3 className="section-title"><i className="bi bi-bell"></i> Notificações</h3>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Email marketing</span>
                <span className="setting-desc">Receber promoções por email</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.emailMarketing} onChange={() => handleToggle('emailMarketing')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Privacidade */}
          <div className="settings-section">
            <h3 className="section-title"><i className="bi bi-shield-check"></i> Privacidade</h3>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Compartilhar localização</span>
                <span className="setting-desc">Permitir sugestões baseadas na localização</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.localizacao} onChange={() => handleToggle('localizacao')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Sobre */}
          <div className="settings-section">
            <h3 className="section-title"><i className="bi bi-info-circle"></i> Sobre</h3>
            <div className="about-item">
              <span className="about-label">Termos de uso</span>
              <button className="link-button">Ver termos</button>
            </div>
            <div className="about-item">
              <span className="about-label">Política de privacidade</span>
              <button className="link-button">Ver política</button>
            </div>
          </div>

          {/* Zona de perigo */}
          <div className="settings-section danger-section">
            <h3 className="section-title"><i className="bi bi-exclamation-triangle"></i> Zona de perigo</h3>
            <div className="danger-buttons">
              <button className="btn-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right"></i> Sair temporariamente
              </button>
              <button className="btn-danger" onClick={openDeleteModal}>
                <i className="bi bi-trash"></i> Excluir conta
              </button>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <h3>Excluir conta</h3>
              <p>Esta ação é irreversível. Digite <strong>EXCLUIR</strong> para confirmar.</p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #ddd', marginBottom: '1.5rem', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }}
              />
              <div className="modal-actions">
                <button
                  className="btn-confirm-delete"
                  onClick={handleDeleteAccount}
                  disabled={loading || confirmText !== 'EXCLUIR'}
                  style={{ opacity: confirmText !== 'EXCLUIR' ? 0.5 : 1 }}
                >
                  {loading ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Configuracoes
