import React from 'react'

const EventCard = ({ evento, onVerMais }) => (
  <div className="event-card">
    <img src={evento.image} alt={evento.titulo} className="event-image" />
    <div className="event-content">
      <h3 className="event-title">{evento.titulo}</h3>
      <p className="event-type">{evento.tipo}</p>
      <p className="event-date">{evento.data}</p>
      <p className="event-location">📍 {evento.local}</p>
      <div className="event-actions">
        <button className="btn-ver-mais" onClick={() => onVerMais(evento)}>Ver mais</button>
        <button className="btn-favoritar"><i className="bi bi-heart"></i></button>
      </div>
    </div>
  </div>
)

export default EventCard
