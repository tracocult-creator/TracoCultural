import React, { useState, useMemo } from 'react'
import Navbar from '../componentes/Navbar'
import EventCard from '../componentes/EventCard'
import { eventosMock } from '../data/MockData'
import '../estilos/HomePage.css'
import '../estilos/Modal.css'

const estadosBR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const categorias = ['Todas', 'Beleza', 'Automotivo', 'Cinema', 'Sustentabilidade', 'Negócios', 'Festival', 'Infantil', 'Literatura', 'Natal', 'Teatro']

const Home = () => {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [uf, setUf] = useState('')
  const [category, setCategory] = useState('Todas')
  const [busca, setBusca] = useState('')

  const eventosFiltrados = useMemo(() => {
    return eventosMock.filter((e) => {
      const matchUf = uf === '' || e.uf === uf
      const matchCategoria = category === 'Todas' || e.tipo === category
      const matchBusca = e.titulo.toLowerCase().includes(busca.toLowerCase())
      return matchUf && matchCategoria && matchBusca
    })
  }, [uf, category, busca])

  const handleVerMais = (evento) => {
    setSelectedEvent(evento)
    setShowEventModal(true)
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
        {eventosFiltrados.length === 0 ? (
          <p style={{ color: 'white', opacity: 0.8 }}>Nenhum evento encontrado.</p>
        ) : (
          eventosFiltrados.map((evento) => (
            <EventCard key={evento.id} evento={evento} onVerMais={handleVerMais} />
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
            <div className="modal-actions">
              <button onClick={() => setShowFilterModal(false)}>Aplicar</button>
              <button onClick={() => { setCategory('Todas'); setUf(''); setShowFilterModal(false) }}>Limpar</button>
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
              <img src={selectedEvent.image} alt={selectedEvent.titulo} className="event-modal-image" />
              <div className="event-modal-info-section">
                <h2 className="event-modal-title">{selectedEvent.titulo}</h2>
                <p className="event-modal-info">📅 {selectedEvent.data} | 📍 {selectedEvent.local}</p>
                <div className="event-modal-actions">
                  <button className="btn-ingressos">INGRESSOS</button>
                  <button className="btn-icon"><i className="bi bi-share"></i></button>
                  <button className="btn-icon"><i className="bi bi-heart"></i></button>
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
