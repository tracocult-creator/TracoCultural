import React, { useState, useEffect, useCallback } from 'react'
import Navbar from '../componentes/Navbar'
import '../estilos/HomePage.css'
import '../estilos/Modal.css'
import { useAuth } from '../contexts/AuthContext'
import api from '../servicos/api'

const estadosBR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const categorias = ['Todas', 'Beleza', 'Automotivo', 'Cinema', 'Sustentabilidade', 'Negócios', 'Festival', 'Infantil', 'Literatura', 'Natal', 'Teatro']

const formatarData = (inicio, fim) => {
  const d = new Date(inicio).toLocaleDateString('pt-BR')
  return fim ? `${d} → ${new Date(fim).toLocaleDateString('pt-BR')}` : d
}

const Home = () => {
  const { user } = useAuth()

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [uf, setUf] = useState('')
  const [category, setCategory] = useState('Todas')
  const [dateFilter, setDateFilter] = useState('')

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const [favoritando, setFavoritando] = useState(null)

  const buscarEventos = useCallback(() => {
    setLoading(true)
    const params = {}
    if (uf) params.cidade = uf
    if (category !== 'Todas') params.categoria = category
    if (dateFilter) params.data = dateFilter
    if (busca) params.busca = busca

    api.get('/api/v1/eventos', { params })
      .then(({ data }) => setEventos(data))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false))
  }, [uf, category, dateFilter, busca])

  useEffect(() => {
    buscarEventos()
  }, [buscarEventos])

  const isOwner = (evento) => user && evento.idUsuarioFk && user.id === evento.idUsuarioFk

  const handleVerMais = (evento) => {
    setSelectedEvent({
      image: evento.cardImage ? `data:image/jpeg;base64,${evento.cardImage}` : null,
      title: evento.nome,
      date: formatarData(evento.dataInicio, evento.dataFim),
      location: evento.cidade,
      descricao: evento.descricao || 'Sem descrição disponível.',
      linkexterno: evento.linkexterno,
      autor: evento.nomeUsuario || null,
      autorIcone: evento.iconeUsuario || null,
      autorCor: evento.corFundoUsuario || '#8E5E56',
      autorEstado: evento.estadoUsuario || null,
      eventoOriginal: evento,
    })
    setShowEventModal(true)
  }

  const handleFavoritar = async (eventoId) => {
    if (!user) return
    setFavoritando(eventoId)
    try {
      await api.post('/api/v1/favoritos', { eventoId })
    } catch {}
    finally { setFavoritando(null) }
  }

  const handleDeletar = async (eventoId) => {
    if (!window.confirm('Tem certeza que deseja deletar este evento?')) return
    try {
      await api.delete(`/api/v1/eventos/${eventoId}?idUsuario=${user.id}`)
      setEventos((prev) => prev.filter((e) => e.id !== eventoId))
      setShowEventModal(false)
    } catch {
      alert('Erro ao deletar evento.')
    }
  }

  const handleAbrirEditar = (evento) => {
    setEditForm({
      id: evento.id,
      nome: evento.nome || '',
      descricao: evento.descricao || '',
      dataInicio: evento.dataInicio ? evento.dataInicio.slice(0, 16) : '',
      dataFim: evento.dataFim ? evento.dataFim.slice(0, 16) : '',
      cidade: evento.cidade || '',
      idCategoriaFk: evento.idCategoriaFk || '',
      linkexterno: evento.linkexterno || '',
    })
    setShowEditModal(true)
  }

  const handleSalvarEdicao = async () => {
    setEditLoading(true)
    try {
      const payload = {
        ...editForm,
        dataInicio: new Date(editForm.dataInicio).toISOString(),
        dataFim: editForm.dataFim ? new Date(editForm.dataFim).toISOString() : null,
        idCategoriaFk: Number(editForm.idCategoriaFk),
      }
      const { data } = await api.put(`/api/v1/eventos/${editForm.id}?idUsuario=${user.id}`, payload)
      setEventos((prev) => prev.map((e) => (e.id === editForm.id ? { ...e, ...data } : e)))
      setShowEditModal(false)
      setShowEventModal(false)
    } catch {
      alert('Erro ao editar evento.')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="home-page">
      <Navbar />

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar eventos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <select
            className="location-select"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            aria-label="Selecionar estado"
          >
            <option value="">Todos os estados</option>
            {estadosBR.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="filter-button" onClick={() => setShowFilterModal(true)}>Filtros</button>
        </div>
      </section>

      <section className="title-section">
        <h2 className="main-title">O que vamos fazer?</h2>
      </section>

      <main className="events-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Carregando eventos...</p>
        ) : eventos.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Nenhum evento encontrado.</p>
        ) : (
          eventos.map((evento) => (
            <div key={evento.id} className="event-card">
              <div className="event-image-wrapper">
                {evento.cardImage && (
                  <img
                    src={`data:image/jpeg;base64,${evento.cardImage}`}
                    alt={evento.nome}
                    className="event-image"
                  />
                )}
                {evento.categoria && (
                  <span className="event-category-badge">{evento.categoria}</span>
                )}
              </div>
              <div className="event-content">
                <h3 className="event-title">{evento.nome}</h3>
                <p className="event-date"><i className="bi bi-calendar3"></i> {formatarData(evento.dataInicio, evento.dataFim)}</p>
                <p className="event-location"><i className="bi bi-geo-alt"></i> {evento.cidade}</p>
                <div className="event-actions">
                  <button className="btn-ver-mais" onClick={() => handleVerMais(evento)}>Ver mais</button>
                  <button
                    className="btn-favoritar"
                    onClick={() => handleFavoritar(evento.id)}
                    disabled={favoritando === evento.id}
                  >
                    <i className="bi bi-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modal de Filtros */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filtros</h3>
            <div className="filter-group">
              <label>Categoria:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Selecionar categoria">
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Data:</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFilterModal(false)}>Aplicar</button>
              <button onClick={() => { setCategory('Todas'); setUf(''); setDateFilter(''); setShowFilterModal(false) }}>Limpar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editForm && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-evento-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            <h3>Editar Evento</h3>

            <label>Nome *</label>
            <input className="form-input" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} maxLength={100} />

            <label>Descrição</label>
            <textarea className="form-textarea" rows={4} value={editForm.descricao} onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} maxLength={255} />

            <div className="edit-row">
              <div>
                <label>Data de Início *</label>
                <input className="form-input" type="datetime-local" value={editForm.dataInicio} onChange={(e) => setEditForm({ ...editForm, dataInicio: e.target.value })} />
              </div>
              <div>
                <label>Data de Término</label>
                <input className="form-input" type="datetime-local" value={editForm.dataFim} onChange={(e) => setEditForm({ ...editForm, dataFim: e.target.value })} />
              </div>
            </div>

            <label>Cidade *</label>
            <input className="form-input" value={editForm.cidade} onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })} maxLength={45} />

            <label>Link Externo</label>
            <input className="form-input" type="url" value={editForm.linkexterno} onChange={(e) => setEditForm({ ...editForm, linkexterno: e.target.value })} placeholder="https://..." />

            <div className="modal-actions">
              <button onClick={handleSalvarEdicao} disabled={editLoading}>{editLoading ? 'Salvando...' : 'Salvar'}</button>
              <button onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>
            <div className="event-modal-header">
              {selectedEvent.image && (
                <img src={selectedEvent.image} alt={selectedEvent.title} className="event-modal-image" />
              )}
              <div className="event-modal-info-section">
                <h2 className="event-modal-title">{selectedEvent.title}</h2>
                <p className="event-modal-info">📅 {selectedEvent.date} | 📍 {selectedEvent.location}</p>
                <div className="event-modal-actions">
                  {selectedEvent.linkexterno ? (
                    <a href={selectedEvent.linkexterno} target="_blank" rel="noreferrer" className="btn-ingressos">INGRESSOS</a>
                  ) : (
                    <button className="btn-ingressos">INGRESSOS</button>
                  )}
                  <button className="btn-icon"><i className="bi bi-share"></i></button>
                  <button className="btn-icon" onClick={() => handleFavoritar(selectedEvent.eventoOriginal?.id)}>
                    <i className="bi bi-heart"></i>
                  </button>
                  {selectedEvent.eventoOriginal && isOwner(selectedEvent.eventoOriginal) && (
                    <>
                      <button className="btn-icon btn-editar" onClick={() => handleAbrirEditar(selectedEvent.eventoOriginal)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon btn-deletar" onClick={() => handleDeletar(selectedEvent.eventoOriginal.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="event-modal-body">
              <div className="event-modal-description">
                {selectedEvent.descricao.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="comments-section">
                <h3 className="comments-title">Avaliações e Comentários</h3>
                <div className="comment-form">
                  <textarea className="comment-input" placeholder="Deixe seu comentário sobre o evento..." rows="3"></textarea>
                  <button className="comment-submit">Enviar</button>
                </div>
                <div className="comments-list">
                  <div className="comment-item">
                    <div className="comment-author">Maria Silva</div>
                    <div className="comment-text">Evento incrível! Super recomendo para quem gosta de arte e cultura.</div>
                  </div>
                  <div className="comment-item">
                    <div className="comment-author">João Santos</div>
                    <div className="comment-text">Organização perfeita e programação diversificada. Já estou ansioso para o próximo!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
