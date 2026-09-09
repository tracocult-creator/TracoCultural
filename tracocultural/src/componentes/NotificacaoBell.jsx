import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../servicos/api'

const ICONES_TIPO = {
  COMENTARIO: 'bi-chat-left-text-fill',
  EVENTO_PROXIMO: 'bi-alarm-fill',
  EVENTO_ATUALIZACAO: 'bi-arrow-repeat',
  GERAL: 'bi-megaphone-fill',
}

const CORES_TIPO = {
  COMENTARIO: { bg: 'rgba(212,163,115,0.16)', fg: '#B8864E', bar: '#D4A373' },
  EVENTO_PROXIMO: { bg: 'rgba(179,65,58,0.14)', fg: '#b3413a', bar: '#b3413a' },
  EVENTO_ATUALIZACAO: { bg: 'rgba(142,94,86,0.16)', fg: '#8E5E56', bar: '#8E5E56' },
  GERAL: { bg: 'rgba(60,35,33,0.12)', fg: '#3C2321', bar: '#3C2321' },
}
const CORES_PADRAO = { bg: 'rgba(142,94,86,0.16)', fg: '#8E5E56', bar: '#8E5E56' }

function formatarDataRelativa(dataISO) {
  const data = new Date(dataISO)
  const diffMs = Date.now() - data.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `há ${diffD}d`
  return data.toLocaleDateString('pt-BR')
}

function formatarDataCompleta(dataISO) {
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const NotificacaoBell = () => {
  const navigate = useNavigate()
  const [notificacoes, setNotificacoes] = useState([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null)
  const wrapperRef = useRef(null)

  const carregar = () => {
    api.get('/notificacoes').then(({ data }) => setNotificacoes(Array.isArray(data) ? data : [])).catch(() => {})
    api.get('/notificacoes/nao-lidas/contagem').then(({ data }) => setNaoLidas(data?.total ?? 0)).catch(() => {})
  }

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 60000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    function aoClicarFora(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setDropdownAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  useEffect(() => {
    function aoApertarEsc(e) {
      if (e.key === 'Escape') setNotificacaoSelecionada(null)
    }
    document.addEventListener('keydown', aoApertarEsc)
    return () => document.removeEventListener('keydown', aoApertarEsc)
  }, [])

  async function abrirNotificacao(n) {
    setDropdownAberto(false)
    setNotificacaoSelecionada(n)
    if (!n.lida) {
      try {
        await api.patch(`/notificacoes/${n.id}/lida`)
        setNotificacoes((prev) => prev.map((x) => x.id === n.id ? { ...x, lida: true } : x))
        setNaoLidas((prev) => Math.max(0, prev - 1))
      } catch {}
    }
  }

  async function marcarTodasComoLidas() {
    try {
      await api.patch('/notificacoes/lidas')
      setNotificacoes((prev) => prev.map((x) => ({ ...x, lida: true })))
      setNaoLidas(0)
    } catch {}
  }

  function irParaEvento() {
    if (notificacaoSelecionada?.idEventoFk) {
      navigate(`/evento/${notificacaoSelecionada.idEventoFk}`)
      setNotificacaoSelecionada(null)
    }
  }

  const cores = notificacaoSelecionada
    ? (CORES_TIPO[notificacaoSelecionada.tipo] || CORES_PADRAO)
    : CORES_PADRAO

  // O painel completo (com overlay) é renderizado via portal direto no
  // <body>, fora da hierarquia do Navbar. Necessário porque o Navbar tem
  // backdrop-filter (efeito "vidro fosco") -- por regra do CSS, isso cria
  // um novo "containing block" para qualquer descendente com position:
  // fixed, fazendo o painel ficar preso/pequeno dentro do Navbar em vez de
  // cobrir a tela inteira. O portal escapa desse problema.
  const painel = notificacaoSelecionada && createPortal(
    <>
      <div className="notif-panel-overlay" onClick={() => setNotificacaoSelecionada(null)} />
      <div className="notif-panel">
        <span className="notif-panel-topbar" style={{ background: cores.bar }} />

        <div className="notif-panel-header">
          <span className="notif-panel-icone" style={{ background: cores.bg, color: cores.fg }}>
            <i className={`bi ${ICONES_TIPO[notificacaoSelecionada.tipo] || 'bi-bell-fill'}`}></i>
          </span>
          <button className="notif-panel-fechar" onClick={() => setNotificacaoSelecionada(null)} aria-label="Fechar">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="notif-panel-body">
          <span className="notif-panel-tipo" style={{ background: cores.bg, color: cores.fg }}>
            {notificacaoSelecionada.tipo === 'COMENTARIO' && 'Comentário'}
            {notificacaoSelecionada.tipo === 'EVENTO_PROXIMO' && 'Evento próximo'}
            {notificacaoSelecionada.tipo === 'EVENTO_ATUALIZACAO' && 'Atualização de evento'}
            {notificacaoSelecionada.tipo === 'GERAL' && 'Aviso geral'}
            {!['COMENTARIO', 'EVENTO_PROXIMO', 'EVENTO_ATUALIZACAO', 'GERAL'].includes(notificacaoSelecionada.tipo) && 'Notificação'}
          </span>

          <p className="notif-panel-mensagem">{notificacaoSelecionada.mensagem}</p>

          <p className="notif-panel-data">
            <i className="bi bi-clock"></i> {formatarDataCompleta(notificacaoSelecionada.dataCriacao)}
          </p>
        </div>

        {notificacaoSelecionada.idEventoFk && (
          <div className="notif-panel-footer">
            <button className="notif-panel-cta" onClick={irParaEvento}>
              Ver evento <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  )

  return (
    <div className="notif-bell-wrapper" ref={wrapperRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setDropdownAberto((v) => !v)}
        aria-label="Notificações"
      >
        <i className="bi bi-bell-fill"></i>
        {naoLidas > 0 && <span className="notif-badge">{naoLidas > 9 ? '9+' : naoLidas}</span>}
      </button>

      {dropdownAberto && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notificações</span>
            {naoLidas > 0 && (
              <button className="notif-marcar-lidas" onClick={marcarTodasComoLidas}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {notificacoes.length === 0 && (
              <div className="notif-vazio">
                <i className="bi bi-bell-slash"></i>
                <span>Nenhuma notificação por enquanto</span>
              </div>
            )}
            {notificacoes.map((n) => {
              const c = CORES_TIPO[n.tipo] || CORES_PADRAO
              return (
                <button
                  key={n.id}
                  className={`notif-item ${!n.lida ? 'notif-item--nao-lida' : ''}`}
                  onClick={() => abrirNotificacao(n)}
                >
                  <span className="notif-item-icone" style={{ background: c.bg, color: c.fg }}>
                    <i className={`bi ${ICONES_TIPO[n.tipo] || 'bi-bell-fill'}`}></i>
                  </span>
                  <span className="notif-item-corpo">
                    <span className="notif-item-msg">{n.mensagem}</span>
                    <span className="notif-item-data">{formatarDataRelativa(n.dataCriacao)}</span>
                  </span>
                  {!n.lida && <span className="notif-item-dot" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {painel}
    </div>
  )
}

export default NotificacaoBell