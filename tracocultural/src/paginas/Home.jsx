import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import MapaEventos from '../componentes/MapaEventos'
import ErrorBoundary from '../componentes/ErrorBoundary'
import ConfirmModal from '../componentes/ConfirmModal'
import EditarEventoModal from '../componentes/EditarEventoModal'
import ShareButton from '../componentes/ShareButton'
import '../estilos/HomePage.css'
import '../estilos/Modal.css'
import { useAuth } from '../contexts/AuthContext'
import api, { buscarEventosPaginado, excluirEvento } from '../servicos/api'
import { normalizeText, isEventoEncerrado } from '../utils/text'

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

const PAGE_SIZE = 12
// Zona Oeste de SP — por enquanto só Barueri representa "perto de você"
// (fixo, não usa geolocalização — mesma decisão tomada no mobile).
const CIDADE_PERTO_DE_VOCE = 'Barueri'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [category, setCategory] = useState('Todas')

  // Modo de busca server-side (com paginação), separado da navegação
  // por categoria (que continua carregando a lista inteira — a base do
  // TCC é pequena o bastante pra isso não pesar).
  const [buscaResultados, setBuscaResultados] = useState([])
  const [buscaPage, setBuscaPage] = useState(0)
  const [buscaTotalPages, setBuscaTotalPages] = useState(0)
  const [buscando, setBuscando] = useState(false)

  const [showMapaModal, setShowMapaModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState(null)
  const [deletingEvento, setDeletingEvento] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [favoritando, setFavoritando] = useState(null)
  const categoryRef = useRef(null)

  const scrollCategorias = (direction) => {
    if (!categoryRef.current) return
    categoryRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  const buscarEventos = useCallback(() => {
    setLoading(true)
    api.get('/eventos')
      .then(({ data }) => setEventos(data))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    buscarEventos()
  }, [buscarEventos])

  // Debounce da busca (300ms) — evita bater no backend a cada tecla
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca.trim()), 300)
    return () => clearTimeout(t)
  }, [busca])

  // Busca server-side com paginação, disparada quando o termo debounced muda
  useEffect(() => {
    if (!buscaDebounced) {
      setBuscaResultados([])
      setBuscaPage(0)
      setBuscaTotalPages(0)
      return
    }
    let ativo = true
    setBuscando(true)
    buscarEventosPaginado({ q: buscaDebounced, page: 0, size: PAGE_SIZE })
      .then(({ data }) => {
        if (!ativo) return
        setBuscaResultados(data.content || [])
        setBuscaPage(0)
        setBuscaTotalPages(data.totalPages || 0)
      })
      .catch(() => { if (ativo) setBuscaResultados([]) })
      .finally(() => { if (ativo) setBuscando(false) })
    return () => { ativo = false }
  }, [buscaDebounced])

  const carregarMaisBusca = () => {
    const proximaPagina = buscaPage + 1
    setBuscando(true)
    buscarEventosPaginado({ q: buscaDebounced, page: proximaPagina, size: PAGE_SIZE })
      .then(({ data }) => {
        setBuscaResultados((prev) => [...prev, ...(data.content || [])])
        setBuscaPage(proximaPagina)
        setBuscaTotalPages(data.totalPages || 0)
      })
      .finally(() => setBuscando(false))
  }

  const handleFavoritar = async (e, eventoId) => {
    e.stopPropagation()
    if (!user) return
    setFavoritando(eventoId)
    try {
      await api.post('/favoritos', { idEventoFk: eventoId })
    } catch {}
    finally { setFavoritando(null) }
  }

  const handleEventoSalvo = (eventoAtualizado) => {
    setEventos((prev) => prev.map((e) => (e.id === eventoAtualizado.id ? { ...e, ...eventoAtualizado } : e)))
    setBuscaResultados((prev) => prev.map((e) => (e.id === eventoAtualizado.id ? { ...e, ...eventoAtualizado } : e)))
    setEditingEvento(null)
  }

  const handleConfirmarExclusao = async () => {
    if (!deletingEvento) return
    setExcluindo(true)
    try {
      await excluirEvento(deletingEvento.id)
      setEventos((prev) => prev.filter((e) => e.id !== deletingEvento.id))
      setBuscaResultados((prev) => prev.filter((e) => e.id !== deletingEvento.id))
      setDeletingEvento(null)
    } catch {
      alert('Erro ao excluir evento. Tente novamente.')
    } finally {
      setExcluindo(false)
    }
  }

  const emModoBusca = buscaDebounced.length > 0
  const listaBase = emModoBusca ? buscaResultados : eventos

  const eventosFiltrados = listaBase.filter((e) => {
    const matchCategoria = category === 'Todas' || normalizeText(e.categoria?.nome) === normalizeText(category)
    // a busca textual já foi feita no servidor quando em modo busca;
    // aqui só reforça no modo lista completa (categoria + busca juntas)
    const matchBusca = emModoBusca || !busca ||
      normalizeText(e.nome).includes(normalizeText(busca)) ||
      normalizeText(e.descricao).includes(normalizeText(busca)) ||
      normalizeText(e.cidade).includes(normalizeText(busca))
    return matchBusca && matchCategoria
  })

  const temFiltrosAtivos = !!busca || category !== 'Todas'
  const limparFiltros = () => { setBusca(''); setCategory('Todas') }

  // Independente de busca/categoria — sempre calculado a partir da lista
  // completa carregada, igual no mobile. Usa "includes" (não igualdade
  // exata) pra tolerar cidade cadastrada como "Barueri, SP" ou variações.
  const eventosPertoDeVoce = eventos.filter((e) =>
    normalizeText(e.cidade).includes(normalizeText(CIDADE_PERTO_DE_VOCE))
  )

  const carregandoAtual = emModoBusca ? (buscando && buscaPage === 0) : loading

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-hero-eyebrow">
            <i className="bi bi-stars"></i> Sua Agenda Cultural
          </span>
          <h1 className="home-hero-title">
            Descubra o que<br /><em>acontece perto de você</em>
          </h1>
          <p className="home-hero-sub">
            Eventos diversos pra você ficar por dentro!
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
            {!!busca && (
              <button className="search-clear-btn" onClick={() => setBusca('')} title="Limpar busca">
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
          <button className="filter-button" onClick={() => setShowMapaModal(true)}>
            <i className="bi bi-geo-alt"></i> Ver no mapa
          </button>
        </div>
      </section>

      <div className="category-strip-wrapper">
        <button className="category-arrow" onClick={() => scrollCategorias('left')}>
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="category-strip" ref={categoryRef}>
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

        <button className="category-arrow" onClick={() => scrollCategorias('right')}>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {/* ── Eventos perto de você (Barueri, só scroll horizontal) ── */}
      {!loading && eventosPertoDeVoce.length > 0 && (
        <section className="nearby-section">
          <div className="nearby-header">
            <i className="bi bi-geo-alt-fill"></i>
            <h2>Eventos perto de você</h2>
            <span className="nearby-cidade">· {CIDADE_PERTO_DE_VOCE}</span>
          </div>

          <div className="nearby-scroll">
            {eventosPertoDeVoce.map((evento) => {
              const encerrado = isEventoEncerrado(evento)
              return (
                <div
                  key={`nearby-${evento.id}`}
                  className={`event-card nearby-card${encerrado ? ' event-card--encerrado' : ''}`}
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
                    {encerrado && <span className="event-encerrado-badge">Encerrado</span>}
                  </div>
                  <div className="event-content">
                    <h3 className="event-title">{evento.nome}</h3>
                    <p className="event-date">
                      <i className="bi bi-calendar3"></i>
                      {formatarData(evento.dataInicio, evento.dataFim)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Results header ── */}
      <div className="results-header">
        <h2 className="results-title">
          {category === 'Todas' ? 'Todos os eventos' : category}
        </h2>
        {!carregandoAtual && (
          <span className="results-count">
            <i className="bi bi-calendar3"></i>
            {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      <main className="events-grid">
        {carregandoAtual ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : eventosFiltrados.length === 0 ? (
          <div className="home-state-wrapper">
            <i className="bi bi-calendar-x home-state-icon"></i>
            <strong style={{ color: 'rgba(255,255,255,.7)' }}>
              {temFiltrosAtivos ? 'Nenhum evento encontrado' : 'Ainda não há eventos por aqui'}
            </strong>
            <span>
              {temFiltrosAtivos
                ? 'Tente ajustar os filtros ou pesquisar por outro termo.'
                : 'Assim que alguém publicar um evento, ele aparece aqui.'}
            </span>
            {temFiltrosAtivos && (
              <button className="btn-limpar-filtros" onClick={limparFiltros}>
                <i className="bi bi-x-lg"></i> Limpar filtros
              </button>
            )}
          </div>
        ) : (
          eventosFiltrados.map((evento) => {
            const isOwner = !!user && evento.idUsuarioFk === user.id
            const encerrado = isEventoEncerrado(evento)
            return (
              <div
                key={evento.id}
                className={`event-card${encerrado ? ' event-card--encerrado' : ''}`}
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

                  {encerrado && <span className="event-encerrado-badge">Encerrado</span>}

                  <div className="event-actions-row">
                    <ShareButton evento={evento} stopPropagation />
                    {isOwner && (
                      <>
                        <button
                          className="event-fav-btn"
                          title="Editar evento"
                          onClick={(e) => { e.stopPropagation(); setEditingEvento(evento) }}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="event-fav-btn event-fav-btn--danger"
                          title="Excluir evento"
                          onClick={(e) => { e.stopPropagation(); setDeletingEvento(evento) }}
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </>
                    )}
                    {user && !isOwner && (
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
                </div>
              </div>
            )
          })
        )}
      </main>

      {emModoBusca && buscaPage + 1 < buscaTotalPages && !carregandoAtual && (
        <div className="carregar-mais-wrapper">
          <button className="btn-carregar-mais" onClick={carregarMaisBusca} disabled={buscando}>
            {buscando ? 'Carregando…' : 'Carregar mais eventos'}
          </button>
        </div>
      )}

      {/* ── Modal do Mapa ── */}
      {showMapaModal && (
        <div className="modal-overlay" onClick={() => setShowMapaModal(false)}>
          <div className="mapa-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMapaModal(false)}>×</button>
            <h3>Eventos no mapa</h3>
            <div className="mapa-modal-body">
              <ErrorBoundary>
                <MapaEventos altura="100%" />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Edição ── */}
      {editingEvento && (
        <EditarEventoModal
          evento={editingEvento}
          onClose={() => setEditingEvento(null)}
          onSalvo={handleEventoSalvo}
        />
      )}

      {/* ── Confirmação de Exclusão ── */}
      {deletingEvento && (
        <ConfirmModal
          title="Excluir este evento?"
          message={`"${deletingEvento.nome}" será removido permanentemente, junto com favoritos e comentários associados.`}
          confirmLabel="Excluir evento"
          loading={excluindo}
          onConfirm={handleConfirmarExclusao}
          onCancel={() => setDeletingEvento(null)}
        />
      )}
    </div>
  )
}

export default Home
