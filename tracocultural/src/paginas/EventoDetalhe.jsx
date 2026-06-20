import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../componentes/Navbar'
import {
  getEventoPorId,
  getComentarios,
  criarComentario,
  deletarComentario,
} from '../servicos/api'
import '../estilos/EventoDetalhe.css'

const formatarDataRelativa = (dataStr) => {
  const agora = new Date()
  const data = new Date(dataStr)
  const diffMin = Math.floor((agora - data) / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  return data.toLocaleDateString('pt-BR')
}

const getIniciais = (nome = '') =>
  nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('')

const EventoDetalhe = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [evento, setEvento] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [novoComentario, setNovoComentario] = useState('')
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [loadingComentarios, setLoadingComentarios] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    getEventoPorId(id)
      .then(({ data }) => setEvento(data))
      .catch(() => navigate('/home'))
      .finally(() => setLoadingEvento(false))

    carregarComentarios()
  }, [id])

  const carregarComentarios = () => {
    setLoadingComentarios(true)
    getComentarios(id)
      .then(({ data }) => setComentarios(data))
      .catch(() => setComentarios([]))
      .finally(() => setLoadingComentarios(false))
  }

  const handleComentar = async () => {
    if (!novoComentario.trim()) return
    setEnviando(true)
    setErro('')
    try {
      await criarComentario(id, novoComentario.trim())
      setNovoComentario('')
      carregarComentarios()
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível enviar o comentário.')
    } finally {
      setEnviando(false)
    }
  }

  const handleDeletarComentario = async (comentarioId) => {
    try {
      await deletarComentario(id, comentarioId)
      carregarComentarios()
    } catch {}
  }

  if (loadingEvento) {
    return (
      <div className="evento-detalhe-page">
        <Navbar />
        <div className="evento-detalhe-loading">
          <i className="bi bi-hourglass-split"></i> Carregando evento…
        </div>
      </div>
    )
  }

  if (!evento) return null

  const temImagem = Boolean(evento.cardImage)

  return (
    <div className="evento-detalhe-page">
      <Navbar />

      {/* Hero */}
      {temImagem && (
        <div className="evento-hero">
          <img
            src={`data:image/jpeg;base64,${evento.cardImage}`}
            alt={evento.nome}
          />
          <div className="evento-hero-overlay" />
          <button className="evento-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i> Voltar
          </button>
        </div>
      )}

      <div className="evento-detalhe-container">
        <div className={`evento-main-card${!temImagem ? ' evento-main-card--no-hero' : ''}`}>

          {/* Botão voltar sem hero */}
          {!temImagem && (
            <button
              className="evento-back-btn"
              style={{ position: 'relative', top: 'unset', left: 'unset', marginBottom: '1rem' }}
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left"></i> Voltar
            </button>
          )}

          {/* Categoria */}
          {evento.categoria && (
            <span className="evento-categoria-badge">
              <i className="bi bi-tag"></i>
              {evento.categoria.nome}
            </span>
          )}

          {/* Título */}
          <h1 className="evento-titulo">{evento.nome}</h1>

          {/* Meta info */}
          <div className="evento-meta">
            <span className="evento-meta-pill">
              <i className="bi bi-calendar3"></i>
              {new Date(evento.dataInicio).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
              {evento.dataFim &&
                ` → ${new Date(evento.dataFim).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}`}
            </span>
            <span className="evento-meta-pill">
              <i className="bi bi-geo-alt"></i>
              {evento.cidade}
            </span>
          </div>

          {/* Descrição */}
          {evento.descricao && (
            <>
              <div className="evento-divider" />
              <p className="evento-descricao">{evento.descricao}</p>
            </>
          )}

          {/* Link externo */}
          {evento.linkExterno && (
            <a
              href={evento.linkExterno}
              target="_blank"
              rel="noreferrer"
              className="evento-link-externo"
            >
              <i className="bi bi-box-arrow-up-right"></i> Saiba mais
            </a>
          )}

          {/* ── Comentários ── */}
          <div className="evento-divider" style={{ marginTop: '2rem' }} />

          <div className="comentarios-section">
            <div className="comentarios-header">
              <h3 className="comentarios-titulo">Comentários</h3>
              <span className="comentarios-count">{comentarios.length}</span>
            </div>

            {/* Formulário */}
            {user ? (
              <div className="comentario-form">
                <textarea
                  className="comentario-textarea"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Compartilhe sua experiência sobre este evento…"
                  maxLength={500}
                  rows={3}
                />
                <div className="comentario-form-footer">
                  <span className="comentario-char-count">
                    {novoComentario.length}/500
                  </span>
                  <button
                    className="comentario-submit-btn"
                    onClick={handleComentar}
                    disabled={enviando || !novoComentario.trim()}
                  >
                    <i className="bi bi-send"></i>
                    {enviando ? 'Enviando…' : 'Publicar'}
                  </button>
                </div>
                {erro && (
                  <p className="comentario-erro">
                    <i className="bi bi-exclamation-circle"></i> {erro}
                  </p>
                )}
              </div>
            ) : (
              <div className="comentario-login-prompt">
                <i className="bi bi-lock"></i> Faça login para deixar um comentário.
              </div>
            )}

            {/* Lista */}
            {loadingComentarios ? (
              <div className="comentarios-empty">
                <i className="bi bi-hourglass-split"></i>
                Carregando comentários…
              </div>
            ) : comentarios.length === 0 ? (
              <div className="comentarios-empty">
                <i className="bi bi-chat-dots"></i>
                Nenhum comentário ainda — seja o primeiro!
              </div>
            ) : (
              <div className="comentarios-lista">
                {comentarios.map((c) => {
                  const nomeAutor = c.nomeUsuario || c.usuario?.nome || 'Usuário'
                  return (
                    <div key={c.id} className="comentario-item">
                      <div className="comentario-item-header">
                        <div className="comentario-autor-info">
                          <div className="comentario-avatar">
                            {getIniciais(nomeAutor)}
                          </div>
                          <span className="comentario-nome">{nomeAutor}</span>
                          <span className="comentario-data">
                            {formatarDataRelativa(c.dataCriacao || c.criadoEm)}
                          </span>
                        </div>
                        {user && user.id === c.idUsuarioFk && (
                          <button
                            className="comentario-deletar-btn"
                            onClick={() => handleDeletarComentario(c.id)}
                            title="Remover comentário"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </div>
                      <p className="comentario-texto">{c.texto}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventoDetalhe