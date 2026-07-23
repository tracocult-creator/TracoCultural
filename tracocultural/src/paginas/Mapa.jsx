import React from 'react'
import Navbar from '../componentes/Navbar'
import MapaEventos from '../componentes/MapaEventos'
import '../estilos/Mapa.css'

const Mapa = () => {
  return (
    <div className="mapa-page">
      <Navbar />

      <div className="mapa-header">
        <h2>Eventos perto de você</h2>
      </div>

      <div style={{ margin: '0 3rem 3rem' }}>
        <MapaEventos altura="65vh" />
      </div>
    </div>
  )
}

export default Mapa