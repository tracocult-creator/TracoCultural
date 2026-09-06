import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificacoes,
  getNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
} from '../servicos/api'

const POLL_MS = 60000 // reconsulta a contagem a cada 60s

const formatarDataRelativa = (dataStr) => {
  const agora = new Date()
  const data = new Date(dataStr)
  const diffMin = Math.floor((agora - data) / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `há ${diffD}d`
  return data.toLocaleDateString('pt-BR')
}

const formatarDataCompleta = (dataStr) => {
  const data = new Date(dataStr)
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const ICONES_TIPO = {
  COMENTARIO: 'bi-chat-left-text-fill',
  EVENTO_PROXIMO: 'bi-alarm-fill',
  EVENTO_ATUALIZACAO: 'bi-pencil-fill',
  GERAL: 'bi-megaphone-fill',
}

const TITULOS_TIPO = {
  COMENTARIO: 'Novo comentário',
  EVENTO_PROXIMO: 'Evento se aproximando',
  EVENTO_ATUALIZACAO: 'Atualização de evento',
  GERAL: 'Aviso geral',
}

/**
 * Sininho de notificações in-app. Sem push de verdade (isso exigiria
 * service worker + VAPID keys) — faz polling leve da contagem de não
 * lidas e busca a lista completa só quando o dropdown é aberto.
 *
 * Clicar numa notificação não navega mais direto pro evento: abre um
 * painel lateral com o conteúdo completo (mensagem, tipo, data cheia) e
 * só navega se a pessoa clicar explicitamente em "Ver evento" dentro dele.
 */
const NotificacaoBell = () => {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [notificacoes, setNotificacoes] = useState([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [painelNotificacao, setPainelNotificacao] = useState(null)
  const ref = useRef(null)

  const buscarContagem = useCallback(() => {
    getNotificacoesNaoLidas()
      .then(({ data }) => setNaoLidas(data.total || 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    buscarContagem()
    const interval = setInterval(buscarContagem, POLL_MS)
    return () => clearInterval(interval)
  }, [buscarContagem])

  useEffect(() => {
    const handleClickFora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  // Fecha o painel lateral com Esc, por acessibilidade/consistência.
  useEffect(() => {
    if (!painelNotificacao) return
    const handleEsc = (e) => { if (e.key === 'Escape') setPainelNotificacao(null) }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [painelNotificacao])

  const abrirDropdown = () => {
    const vaiAbrir = !aberto
    setAberto(vaiAbrir)
    if (vaiAbrir) {
      setCarregando(true)
      getNotificacoes()
        .then(({ data }) => setNotificacoes(data))
        .catch(() => setNotificacoes([]))
        .finally(() => setCarregando(false))
    }
  }

  const handleClicarNotificacao = (n) => {
    if (!n.lida) {
      setNotificacoes((prev) => prev.map((x) => (x.id === n.id ? { ...x, lida: true } : x)))
      setNaoLidas((prev) => Math.max(0, prev - 1))
      marcarNotificacaoComoLida(n.id).catch(() => {})
    }
    setAberto(false)
    setPainelNotificacao(n)
  }

  const handleVerEvento = () => {
    if (!painelNotificacao?.idEventoFk) return
    const idEvento = painelNotificacao.idEventoFk
    setPainelNotificacao(null)
    navigate(`/eventos/${idEvento}`)
  }

  const handleMarcarTodas = (e) => {
    e.stopPropagation()
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    setNaoLidas(0)
    marcarTodasNotificacoesComoLidas().catch(() => {})
  }

  return (
    <div className="notif-bell-wrapper" ref={ref}>
      <button
        className="notif-bell-trigger"
        onClick={abrirDropdown}
        aria-label="Notificações"
        aria-expanded={aberto}
      >
        <i className="bi bi-bell-fill"></i>
        {naoLidas > 0 && (
          <span className="notif-bell-badge">{naoLidas > 9 ? '9+' : naoLidas}</span>
        )}
      </button>

      {aberto && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notificações</span>
            {naoLidas > 0 && (
              <button className="notif-marcar-todas" onClick={handleMarcarTodas}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {carregando ? (
              <div className="notif-dropdown-empty">
                <i className="bi bi-hourglass-split"></i> Carregando…
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="notif-dropdown-empty">
                <i className="bi bi-bell-slash"></i>
                Nenhuma notificação por aqui ainda.
              </div>
            ) : (
              notificacoes.map((n) => (
                <button
                  key={n.id}
                  className={`notif-item${n.lida ? '' : ' notif-item--nao-lida'}`}
                  onClick={() => handleClicarNotificacao(n)}
                >
                  <span className="notif-item-icon">
                    <i className={`bi ${ICONES_TIPO[n.tipo] || 'bi-info-circle-fill'}`}></i>
                  </span>
                  <span className="notif-item-body">
                    <span className="notif-item-mensagem">{n.mensagem}</span>
                    <span className="notif-item-data">{formatarDataRelativa(n.dataCriacao)}</span>
                  </span>
                  {!n.lida && <span className="notif-item-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Painel lateral com a notificação por inteiro */}
      {painelNotificacao && (
        <div className="notif-panel-overlay" onClick={() => setPainelNotificacao(null)}>
          <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
            <div className="notif-panel-header">
              <span className="notif-panel-icon">
                <i className={`bi ${ICONES_TIPO[painelNotificacao.tipo] || 'bi-info-circle-fill'}`}></i>
              </span>
              <span className="notif-panel-tipo">
                {TITULOS_TIPO[painelNotificacao.tipo] || 'Notificação'}
              </span>
              <button
                className="notif-panel-close"
                onClick={() => setPainelNotificacao(null)}
                aria-label="Fechar"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="notif-panel-body">
              <p className="notif-panel-mensagem">{painelNotificacao.mensagem}</p>
              <p className="notif-panel-data">
                <i className="bi bi-clock"></i> {formatarDataCompleta(painelNotificacao.dataCriacao)}
              </p>
            </div>

            {painelNotificacao.idEventoFk && (
              <div className="notif-panel-actions">
                <button className="notif-panel-btn-evento" onClick={handleVerEvento}>
                  Ver evento <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificacaoBell