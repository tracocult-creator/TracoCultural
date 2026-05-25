import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import '../estilos/FavoritesPage.css'
import { useAuth } from '../contexts/AuthContext'
import { getFavoritos, removerFavorito as removerFavoritoApi } from '../servicos/api'

const Favoritos = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getFavoritos()
      .then(({ data }) => setFavoritos(data))
      .catch(() => setFavoritos([]))
      .finally(() => setLoading(false))
  }, [user])

  const removerFavorito = async (id) => {
    try {
      await removerFavoritoApi(id)
      setFavoritos((prev) => prev.filter((e) => e.id !== id))
    } catch {}
  }

  return (
    <div className="favorites-page">
      <Navbar />

      <section className="title-section">
        <h2 className="main-title">Meus Eventos Favoritos</h2>
      </section>

      <main className="favorites-content">
        {loading ? (
          <div className="empty-favorites"><p>Carregando...</p></div>
        ) : favoritos.length === 0 ? (
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
