import React, { useState } from 'react'
import { enviarNotificacaoGeral } from '../../servicos/api'

const LIMITE_CARACTERES = 5000

const SUGESTOES = [
  'A plataforma passará por manutenção programada às 22h.',
  'Novidade no ar! Confira os novos recursos do TraçoCultural.',
  'Lembrete: revise seus eventos favoritos para não perder nenhum.',
]

const NotificacoesAdmin = ({ showToast }) => {
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [historico, setHistorico] = useState([])

  const restantes = LIMITE_CARACTERES - mensagem.length
  const podeEnviar = mensagem.trim().length > 0 && restantes >= 0 && !enviando

  const handleEnviar = async () => {
    const texto = mensagem.trim()
    if (!texto) {
      showToast('Escreva uma mensagem antes de enviar.', 'error')
      return
    }
    if (texto.length > LIMITE_CARACTERES) {
      showToast(`A mensagem excede o limite de ${LIMITE_CARACTERES} caracteres.`, 'error')
      return
    }

    setEnviando(true)
    try {
      const { data } = await enviarNotificacaoGeral(texto)
      const total = data?.totalEnviado ?? 0
      showToast(
        `Notificação enviada para ${total} ${total === 1 ? 'pessoa' : 'pessoas'}!`,
        'success'
      )
      setHistorico((prev) => [
        { mensagem: texto, total, data: new Date() },
        ...prev,
      ].slice(0, 5))
      setMensagem('')
    } catch {
      showToast('Erro ao enviar a notificação. Tente novamente.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const formatarHora = (d) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Notificações</h2>
      </div>

      <div className="admin-notif-layout">
        <div className="admin-notif-card">
          <div className="admin-notif-card-header">
            <span className="admin-notif-icon">
              <i className="bi bi-megaphone-fill"></i>
            </span>
            <div>
              <h3>Notificação geral</h3>
              <p>
                Enviada para <strong>todos os usuários</strong> da plataforma — use para avisos
                sobre o sistema, manutenções ou novidades. Para avisar só quem favoritou um
                evento específico, isso é feito na tela de edição desse evento.
              </p>
            </div>
          </div>

          <div className="admin-field">
            <label>Mensagem</label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Ex: A plataforma passará por manutenção às 22h."
              rows={5}
              maxLength={LIMITE_CARACTERES + 5000}
            />
            <span className={`admin-char-counter ${restantes < 0 ? 'admin-char-counter--over' : ''}`}>
              {mensagem.length}/{LIMITE_CARACTERES}
            </span>
          </div>

          <div className="admin-notif-sugestoes">
            <span>Sugestões rápidas:</span>
            <div className="admin-notif-sugestoes-list">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="admin-notif-sugestao"
                  onClick={() => setMensagem(s)}
                  disabled={enviando}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-notif-actions">
            <button
              className="admin-btn admin-btn--primary admin-btn--lg"
              onClick={handleEnviar}
              disabled={!podeEnviar}
            >
              <i className="bi bi-send-fill"></i>
              {enviando ? 'Enviando...' : 'Enviar para todos'}
            </button>
          </div>
        </div>

        <div className="admin-notif-history">
          <h3><i className="bi bi-clock-history"></i> Enviadas nesta sessão</h3>
          {historico.length === 0 ? (
            <p className="admin-notif-history-empty">
              Nenhuma notificação enviada ainda nesta sessão.
            </p>
          ) : (
            <ul>
              {historico.map((h, i) => (
                <li key={i}>
                  <div className="admin-notif-history-top">
                    <span className="admin-badge admin-badge--green">
                      <i className="bi bi-check-circle"></i> {h.total} envio(s)
                    </span>
                    <span className="admin-notif-history-hora">{formatarHora(h.data)}</span>
                  </div>
                  <p>{h.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default NotificacoesAdmin