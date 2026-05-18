import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import EventCard from '../componentes/EventCard'
import '../estilos/FavoritesPage.css'
import { eventosMock } from '../data/MockData'

const Favoritos = () => {
  const navigate = useNavigate()
  const [favoritos, setFavoritos] = useState(eventosMock.slice(0, 3))

  const removerFavorito = (id) => {
    setFavoritos((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="favorites-page">
      <Navbar />

      <section className="title-section">
        <h2 className="main-title">Meus Eventos Favoritos</h2>
      </section>

      <main className="favorites-content">
        {favoritos.length === 0 ? (
          <div className="empty-favorites">
            <p>Você ainda não tem eventos favoritos.</p>
            <button className="btn-explore" onClick={() => navigate('/home')}>Explorar Eventos</button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoritos.map((evento) => (
              <div key={evento.id} className="favorite-card">
                <img src={evento.image} alt={evento.titulo} className="favorite-image" />
                <div className="favorite-content">
                  <h3 className="favorite-title">{evento.titulo}</h3>
                  <p className="favorite-type">{evento.tipo}</p>
                  <p className="favorite-date">{evento.data}</p>
                  <p className="favorite-location">📍 {evento.local}</p>
                  <div className="favorite-actions">
                    <button className="btn-ver-mais">Ver mais</button>
                    <button className="btn-remover" onClick={() => removerFavorito(evento.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Favoritos
