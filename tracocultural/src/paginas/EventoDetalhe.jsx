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
      setErro(err.response?.data?.message || 'Erro ao comentar.')
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

  if (loadingEvento) return <><Navbar /><p style={{ padding: '2rem' }}>Carregando evento...</p></>
  if (!evento) return null

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

        {evento.cardImage && (
          <img
            src={`data:image/jpeg;base64,${evento.cardImage}`}
            alt={evento.nome}
            style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', maxHeight: '350px', objectFit: 'cover' }}
          />
        )}

        <h1 style={{ marginBottom: '0.5rem' }}>{evento.nome}</h1>
        <p style={{ color: '#666' }}>
          📅 {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
          {evento.dataFim && ` → ${new Date(evento.dataFim).toLocaleDateString('pt-BR')}`}
        </p>
        <p style={{ color: '#666' }}>📍 {evento.cidade}</p>
        {evento.categoria && <p style={{ color: '#888' }}>🏷 {evento.categoria.nome}</p>}
        {evento.descricao && <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{evento.descricao}</p>}
        {evento.linkExterno && (
          <a href={evento.linkExterno} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: '1rem', color: '#8E5E56' }}>
            🔗 Saiba mais
          </a>
        )}

        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Comentários ({comentarios.length})</h3>

          {user && (
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Escreva um comentário..."
                maxLength={500}
                rows={3}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <small style={{ color: '#999' }}>{novoComentario.length}/500</small>
                <button
                  onClick={handleComentar}
                  disabled={enviando || !novoComentario.trim()}
                  style={{ padding: '0.5rem 1.2rem', background: '#8E5E56', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
              {erro && <p style={{ color: 'red', marginTop: '0.5rem' }}>{erro}</p>}
            </div>
          )}

          {loadingComentarios ? (
            <p style={{ color: '#999' }}>Carregando comentários...</p>
          ) : comentarios.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comentarios.map((c) => (
              <div key={c.id} style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{c.nomeUsuario || c.usuario?.nome || 'Usuário'}</strong>
                    <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                      {formatarDataRelativa(c.dataCriacao || c.criadoEm)}
                    </span>
                    <p style={{ margin: '0.4rem 0 0', lineHeight: 1.5 }}>{c.texto}</p>
                  </div>
                  {user && user.id === c.idUsuarioFk && (
                    <button
                      onClick={() => handleDeletarComentario(c.id)}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}
                      title="Remover comentário"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default EventoDetalhe
