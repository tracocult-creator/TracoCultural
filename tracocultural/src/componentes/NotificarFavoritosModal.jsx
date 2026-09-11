import React, { useState } from 'react'
import { notificarFavoritosDoEvento } from '../servicos/api'

const LIMITE_CARACTERES = 500

/**
 * Modal usado pelo dono do evento (ou admin) para mandar um aviso só
 * pra quem favoritou aquele evento específico. Chama
 * POST /eventos/{id}/notificar-favoritos no backend.
 */
const NotificarFavoritosModal = ({ evento, onClose, onEnviado }) => {
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [enviadoInfo, setEnviadoInfo] = useState(null)

  const restantes = LIMITE_CARACTERES - mensagem.length
  const podeEnviar = mensagem.trim().length > 0 && restantes >= 0 && !enviando

  const handleEnviar = async () => {
    const texto = mensagem.trim()
    if (!texto) {
      setErro('Escreva uma mensagem antes de enviar.')
      return
    }
    setErro('')
    setEnviando(true)
    try {
      const { data } = await notificarFavoritosDoEvento(evento.id, texto)
      const total = data?.totalEnviado ?? 0
      setEnviadoInfo(total)
      onEnviado?.(total)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao enviar a notificação. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notify-fav-modal" onClick={(e) => e.stopPropagation()}>
        <h3><i className="bi bi-bell-fill"></i> Notificar quem favoritou</h3>
        <p className="notify-fav-subtitle">
          Esse aviso vai só pra quem favoritou <strong>{evento.nome}</strong>.
        </p>

        {enviadoInfo === null ? (
          <>
            <label>Mensagem</label>
            <textarea
              className="form-textarea"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Ex: O horário do evento mudou para as 19h!"
              rows={4}
              maxLength={LIMITE_CARACTERES + 200}
              disabled={enviando}
              autoFocus
            />
            <span className={`notify-fav-counter ${restantes < 0 ? 'notify-fav-counter--over' : ''}`}>
              {mensagem.length}/{LIMITE_CARACTERES}
            </span>

            {erro && (
              <p className="notify-fav-erro">
                <i className="bi bi-exclamation-circle"></i> {erro}
              </p>
            )}

            <div className="modal-actions">
              <button onClick={handleEnviar} disabled={!podeEnviar}>
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
              <button onClick={onClose} disabled={enviando}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <div className="notify-fav-sucesso">
              <i className="bi bi-check-circle-fill"></i>
              {enviadoInfo > 0
                ? `Enviado para ${enviadoInfo} ${enviadoInfo === 1 ? 'pessoa' : 'pessoas'} que favoritaram esse evento.`
                : 'Ninguém favoritou esse evento ainda, então não havia pra quem enviar.'}
            </div>
            <div className="modal-actions">
              <button onClick={onClose}>Fechar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NotificarFavoritosModal