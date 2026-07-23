import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import MapaEventos from '../componentes/MapaEventos'
import '../estilos/HomePage.css'
import '../estilos/Modal.css'
import { useAuth } from '../contexts/AuthContext'
import api from '../servicos/api'

const CATEGORIAS = [
  'Todas', 'Social', 'Música', 'Cultura & Arte', 'Profissional',
  'Educação', 'Tecnologia', 'Bem-Estar', 'Esporte', 'Gastronomia',
  'Comércio', 'Kids', 'Religioso', 'Comunidade', 'Geek', 'Viagem',
]

const formatarData = (inicio, fim) => {
  const opts = { day: '2-digit', month: 'short', year: 'numeric' }
  const d = new Date(inicio).toLocaleDateString('pt-BR', opts)
  return fim ? `${d} → ${new Date(fim).toLocaleDateString('pt-BR', opts)}` : d
}

/* Skeleton cards durante o loading */
const SkeletonCard = () => (
  <div className="event-card event-card--skeleton">
    <div className="skeleton-image" />
    <div className="event-content" style={{ gap: '0.5rem' }}>
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line skeleton-line--short" />
      <div className="skeleton-line skeleton-line--shorter" />
    </div>
  </div>
)

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [uf, setUf] = useState('')
  const [category, setCategory] = useState('Todas')
  const [dateFilter, setDateFilter] = useState('')

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showMapaModal, setShowMapaModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [favoritando, setFavoritando] = useState(null)
  const categoryRef = useRef(null)

const scrollCategorias = (direction) => {
  if (!categoryRef.current) return

  categoryRef.current.scrollBy({
    left: direction === 'left' ? -300 : 300,
    behavior: 'smooth'
  })
}

  const buscarEventos = useCallback(() => {
    setLoading(true)
    const params = {}
    if (uf) params.cidade = uf

    api.get('/eventos', { params })
      .then(({ data }) => setEventos(data))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false))
  }, [uf])

  useEffect(() => {
    buscarEventos()
  }, [buscarEventos])

  const handleFavoritar = async (e, eventoId) => {
    e.stopPropagation()
    if (!user) return
    setFavoritando(eventoId)
    try {
      await api.post('/favoritos', { idEventoFk: eventoId })
    } catch {}
    finally { setFavoritando(null) }
  }

  const handleAbrirEditar = (evento) => {
    setEditForm({
      id: evento.id,
      nome: evento.nome || '',
      descricao: evento.descricao || '',
      dataInicio: evento.dataInicio ? evento.dataInicio.slice(0, 16) : '',
      dataFim: evento.dataFim ? evento.dataFim.slice(0, 16) : '',
      cidade: evento.cidade || '',
      linkExterno: evento.linkExterno || '',
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
      }
      const { data } = await api.put(`/eventos/${editForm.id}`, payload)
      setEventos((prev) => prev.map((e) => (e.id === editForm.id ? { ...e, ...data } : e)))
      setShowEditModal(false)
    } catch {
      alert('Erro ao editar evento.')
    } finally {
      setEditLoading(false)
    }
  }

  const eventosFiltrados = eventos.filter((e) => {
    const matchBusca = !busca ||
      e.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      e.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      e.cidade?.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = category === 'Todas' || e.categoria?.nome === category
    return matchBusca && matchCategoria
  })

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-hero-eyebrow">
            <i className="bi bi-stars"></i> Agenda cultural
          </span>
          <h1 className="home-hero-title">
            Descubra o que<br /><em>acontece perto de você</em>
          </h1>
          <p className="home-hero-sub">
            Eventos de música, arte, gastronomia e muito mais — salve favoritos e fique por dentro da cena cultural.
          </p>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar eventos, artistas ou lugares…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="location-input"
            placeholder="Cidade…"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
          />
          <button className="filter-button" onClick={() => setShowFilterModal(true)}>
            <i className="bi bi-sliders"></i> Filtros
          </button>
          <button className="filter-button" onClick={() => setShowMapaModal(true)}>
            <i className="bi bi-geo-alt"></i> Ver no mapa
          </button>
        </div>
      </section>

     <div className="category-strip-wrapper">

  <button
    className="category-arrow"
    onClick={() => scrollCategorias('left')}
  >
    <i className="bi bi-chevron-left"></i>
  </button>

  <div
    className="category-strip"
    ref={categoryRef}
  >
    {CATEGORIAS.map((cat) => (
      <button
        key={cat}
        className={`category-chip${category === cat ? ' category-chip--active' : ''}`}
        onClick={() => setCategory(cat)}
      >
        {cat}
      </button>
    ))}
  </div>

  <button
    className="category-arrow"
    onClick={() => scrollCategorias('right')}
  >
    <i className="bi bi-chevron-right"></i>
  </button>

</div>

      {/* ── Results header ── */}
      <div className="results-header">
        <h2 className="results-title">
          {category === 'Todas' ? 'Todos os eventos' : category}
        </h2>
        {!loading && (
          <span className="results-count">
            <i className="bi bi-calendar3"></i>
            {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      <main className="events-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : eventosFiltrados.length === 0 ? (
          <div className="home-state-wrapper">
            <i className="bi bi-calendar-x home-state-icon"></i>
            <strong style={{ color: 'rgba(255,255,255,.7)' }}>Nenhum evento encontrado</strong>
            <span>Tente ajustar os filtros ou pesquisar por outra cidade.</span>
          </div>
        ) : (
          eventosFiltrados.map((evento) => (
            <div
              key={evento.id}
              className="event-card"
              onClick={() => navigate(`/eventos/${evento.id}`)}
            >
              <div className="event-image-wrapper">
                {evento.cardImage ? (
                  <img
                    src={`data:image/jpeg;base64,${evento.cardImage}`}
                    alt={evento.nome}
                    className="event-image"
                  />
                ) : (
                  <div className="event-image event-image--empty">
                    <i className="bi bi-calendar-event"></i>
                  </div>
                )}

                {evento.categoria && (
                  <span className="event-category-badge">{evento.categoria.nome}</span>
                )}

                {user && (
                  <button
                    className="event-fav-btn"
                    onClick={(e) => handleFavoritar(e, evento.id)}
                    disabled={favoritando === evento.id}
                    title="Favoritar"
                  >
                    <i className="bi bi-heart"></i>
                  </button>
                )}
              </div>

              <div className="event-content">
                <h3 className="event-title">{evento.nome}</h3>
                <p className="event-date">
                  <i className="bi bi-calendar3"></i>
                  {formatarData(evento.dataInicio, evento.dataFim)}
                </p>
                <p className="event-location">
                  <i className="bi bi-geo-alt"></i>
                  {evento.cidade}
                </p>
                <div className="event-actions">
                  <button
                    className="btn-ver-mais"
                    onClick={(e) => { e.stopPropagation(); navigate(`/eventos/${evento.id}`) }}
                  >
                    Ver mais
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* ── Modal de Filtros ── */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filtros</h3>
            <div className="filter-group">
              <label>Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Selecionar categoria">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Data</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFilterModal(false)}>Aplicar</button>
              <button onClick={() => { setCategory('Todas'); setUf(''); setDateFilter(''); setShowFilterModal(false) }}>
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal do Mapa ── */}
      {showMapaModal && (
        <div className="modal-overlay" onClick={() => setShowMapaModal(false)}>
          <div className="mapa-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMapaModal(false)}>×</button>
            <h3>Eventos no mapa</h3>
            <div className="mapa-modal-body">
              <MapaEventos altura="100%" dentroModal />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Edição ── */}
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
            <input className="form-input" type="url" value={editForm.linkExterno} onChange={(e) => setEditForm({ ...editForm, linkExterno: e.target.value })} placeholder="https://…" />

            <div className="modal-actions">
              <button onClick={handleSalvarEdicao} disabled={editLoading}>{editLoading ? 'Salvando…' : 'Salvar'}</button>
              <button onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home