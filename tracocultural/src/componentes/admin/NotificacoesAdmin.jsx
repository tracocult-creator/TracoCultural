import React, { useEffect, useState } from 'react'
import {
  enviarNotificacaoGeral,
  listarEnviosNotificacao,
  editarEnvioNotificacao,
  excluirEnvioNotificacao,
} from '../../servicos/api'

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
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)

  const [editandoId, setEditandoId] = useState(null)
  const [textoEdicao, setTextoEdicao] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [excluindoId, setExcluindoId] = useState(null)

  const restantes = LIMITE_CARACTERES - mensagem.length
  const podeEnviar = mensagem.trim().length > 0 && restantes >= 0 && !enviando

  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = () => {
    setCarregandoHistorico(true)
    listarEnviosNotificacao()
      .then(({ data }) => setHistorico((data || []).filter((e) => e.tipo === 'GERAL')))
      .catch(() => setHistorico([]))
      .finally(() => setCarregandoHistorico(false))
  }

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
      if (data?.envio) {
        setHistorico((prev) => [data.envio, ...prev])
      } else {
        carregarHistorico()
      }
      setMensagem('')
    } catch {
      showToast('Erro ao enviar a notificação. Tente novamente.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const iniciarEdicao = (envio) => {
    setEditandoId(envio.id)
    setTextoEdicao(envio.mensagem)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setTextoEdicao('')
  }

  const salvarEdicao = async (id) => {
    const texto = textoEdicao.trim()
    if (!texto) {
      showToast('A mensagem não pode ficar vazia.', 'error')
      return
    }
    setSalvandoEdicao(true)
    try {
      const { data } = await editarEnvioNotificacao(id, texto)
      setHistorico((prev) => prev.map((e) => (e.id === id ? data : e)))
      showToast('Envio atualizado.', 'success')
      cancelarEdicao()
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao editar o envio.', 'error')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  const excluirEnvio = async (id) => {
    if (!window.confirm('Excluir esse envio? Ele também some da lista de notificações de quem recebeu.')) return
    setExcluindoId(id)
    try {
      await excluirEnvioNotificacao(id)
      setHistorico((prev) => prev.filter((e) => e.id !== id))
      showToast('Envio excluído.', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao excluir o envio.', 'error')
    } finally {
      setExcluindoId(null)
    }
  }

  const formatarData = (iso) => {
    const d = new Date(iso)
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

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
          <h3><i className="bi bi-clock-history"></i> Notificações enviadas</h3>

          {carregandoHistorico ? (
            <p className="admin-notif-history-empty">Carregando histórico…</p>
          ) : historico.length === 0 ? (
            <p className="admin-notif-history-empty">
              Nenhuma notificação geral enviada ainda.
            </p>
          ) : (
            <ul>
              {historico.map((h) => (
                <li key={h.id}>
                  <div className="admin-notif-history-top">
                    <span className="admin-badge admin-badge--green">
                      <i className="bi bi-check-circle"></i> {h.totalDestinatarios} envio(s)
                    </span>
                    <span className="admin-notif-history-hora">
                      {formatarData(h.dataCriacao)}
                      {h.dataAtualizacao && ' · editado'}
                    </span>
                  </div>

                  {editandoId === h.id ? (
                    <>
                      <textarea
                        className="admin-notif-history-edit-textarea"
                        value={textoEdicao}
                        onChange={(e) => setTextoEdicao(e.target.value)}
                        rows={3}
                        maxLength={LIMITE_CARACTERES}
                      />
                      <div className="admin-notif-history-actions">
                        <button
                          className="admin-btn admin-btn--primary"
                          onClick={() => salvarEdicao(h.id)}
                          disabled={salvandoEdicao}
                        >
                          {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button className="admin-btn" onClick={cancelarEdicao} disabled={salvandoEdicao}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{h.mensagem}</p>
                      <div className="admin-notif-history-actions">
                        <button className="admin-btn" onClick={() => iniciarEdicao(h)}>
                          <i className="bi bi-pencil"></i> Editar
                        </button>
                        <button
                          className="admin-btn admin-btn--danger"
                          onClick={() => excluirEnvio(h.id)}
                          disabled={excluindoId === h.id}
                        >
                          <i className="bi bi-trash3"></i> {excluindoId === h.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </>
                  )}
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