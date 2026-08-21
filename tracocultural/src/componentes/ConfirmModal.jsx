import React from 'react'

/**
 * Modal de confirmação genérico pra ações destrutivas (excluir comentário,
 * excluir evento, etc). Sempre bloqueia a ação até o usuário confirmar
 * explicitamente — nada de excluir com um clique só.
 */
const ConfirmModal = ({
  title = 'Tem certeza?',
  message,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
      <div className={`confirm-modal-icon ${danger ? 'confirm-modal-icon--danger' : ''}`}>
        <i className={danger ? 'bi bi-exclamation-triangle-fill' : 'bi bi-question-circle-fill'}></i>
      </div>
      <h3>{title}</h3>
      {message && <p className="confirm-modal-message">{message}</p>}
      <div className="modal-actions">
        <button
          className={danger ? 'btn-confirm-danger' : ''}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Excluindo…' : confirmLabel}
        </button>
        <button onClick={onCancel} disabled={loading}>{cancelLabel}</button>
      </div>
    </div>
  </div>
)

export default ConfirmModal
