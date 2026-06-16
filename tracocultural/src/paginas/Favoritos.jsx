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

  const removerFavorito = async (eventoId) => {
    try {
      await removerFavoritoApi(eventoId)
      setFavoritos((prev) => prev.filter((f) => f.evento.id !== eventoId))
    } catch {}
  }

  return (
    <div className="favorites-page">
      <Navbar />

      <section className="title-section">
        <div>
          <span className="page-eyebrow">Sua curadoria</span>
          <h2 className="main-title">Meus Eventos Favoritos</h2>
          <p className="page-subtitle">Acesse rapidamente os eventos que você quer acompanhar.</p>
        </div>
      </section>

      <main className="favorites-content">
        {loading ? (
          <div className="empty-favorites"><p>Carregando...</p></div>
        ) : favoritos.length === 0 ? (
          <div className="empty-favorites">
            <p>Você ainda não tem eventos favoritos.</p>
            <button className="btn-explore" onClick={() => navigate('/home')}>
              <i className="bi bi-compass"></i> Explorar Eventos
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoritos.map((fav) => {
              const titulo = fav.evento.nome
              const imagem = fav.evento.cardImage ? `data:image/jpeg;base64,${fav.evento.cardImage}` : null
              const categoria = fav.evento.categoria?.nome
              const data = fav.evento.dataInicio ? new Date(fav.evento.dataInicio).toLocaleDateString('pt-BR') : null
              const local = fav.evento.cidade || 'Local a confirmar'

              return (
              <div key={fav.id} className="favorite-card">
                <div className="favorite-image-wrap">
                  {imagem ? (
                    <img src={imagem} alt={titulo} className="favorite-image" />
                  ) : (
                    <div className="favorite-image favorite-image--empty">
                      <i className="bi bi-calendar-heart"></i>
                    </div>
                  )}
                  {categoria && <span className="favorite-badge">{categoria}</span>}
                </div>
                <div className="favorite-content">
                  <h3 className="favorite-title">{titulo}</h3>
                  {data && <p className="favorite-date"><i className="bi bi-calendar3"></i> {data}</p>}
                  <p className="favorite-location"><i className="bi bi-geo-alt"></i> {local}</p>
                  <div className="favorite-actions">
                    <button className="btn-ver-mais">Ver mais</button>
                    <button className="btn-remover" onClick={() => removerFavorito(fav.evento.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Favoritos
