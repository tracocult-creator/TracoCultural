import React, { useState, useCallback } from 'react'
import Navbar from '../componentes/Navbar'
import MapaEventos from '../componentes/MapaEventos'
import '../estilos/Mapa.css'

const CATEGORIAS_PRINCIPAIS = [
  { nome: 'Todos', icone: 'bi-geo-alt-fill', cor: '#3C2321' },
  { nome: 'Música', icone: 'bi-music-note-beamed', cor: '#e85d75' },
  { nome: 'Cultura & Arte', icone: 'bi-easel2-fill', cor: '#8a5cf5' },
  { nome: 'Teatro', icone: 'bi-emoji-laughing-fill', cor: '#e8a13d' },
  { nome: 'Gastronomia', icone: 'bi-cup-hot-fill', cor: '#4a9d6b' },
]

const CATEGORIAS_EXTRA = [
  { nome: 'Esporte', icone: 'bi-trophy-fill', cor: '#2f8f7a' },
  { nome: 'Tecnologia', icone: 'bi-cpu-fill', cor: '#3d7ae8' },
  { nome: 'Kids', icone: 'bi-balloon-fill', cor: '#e86ba0' },
  { nome: 'Comunidade', icone: 'bi-people-fill', cor: '#b8864e' },
]

const Mapa = () => {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [mostrarExtras, setMostrarExtras] = useState(false)
  const [contagem, setContagem] = useState(0)
  const [carregandoContagem, setCarregandoContagem] = useState(true)

  const aoAtualizarContagem = useCallback((total, carregando) => {
    setContagem(total)
    setCarregandoContagem(carregando)
  }, [])

  const categorias = mostrarExtras
    ? [...CATEGORIAS_PRINCIPAIS, ...CATEGORIAS_EXTRA]
    : CATEGORIAS_PRINCIPAIS

  return (
    <div className="mapa-page">
      <Navbar />

      <div className="mapa-header">
        <div className="mapa-header-titulo">
          <h2>Eventos perto de você</h2>
          <p>
            {carregandoContagem
              ? 'Carregando eventos...'
              : `${contagem} evento(s) localizado(s)`}
          </p>
        </div>

        <div className="mapa-header-acoes">
          <div className="mapa-busca-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Buscar evento ou localidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button type="button" className="mapa-filtros-btn">
            <i className="bi bi-sliders"></i> Filtros
          </button>
        </div>
      </div>

      <div className="mapa-shell">
        <MapaEventos
          altura="65vh"
          busca={busca}
          categoria={categoria}
          mostrarContador={false}
          aoAtualizarContagem={aoAtualizarContagem}
        />

        <div className="mapa-categorias-bar">
          {categorias.map((cat) => (
            <button
              key={cat.nome}
              type="button"
              className={`mapa-categoria-chip${categoria === cat.nome ? ' mapa-categoria-chip--ativo' : ''}`}
              style={categoria === cat.nome ? { background: cat.cor, borderColor: cat.cor } : { color: cat.cor }}
              onClick={() => setCategoria(cat.nome)}
            >
              <i className={`bi ${cat.icone}`}></i>
              {cat.nome}
            </button>
          ))}
          <button
            type="button"
            className="mapa-categoria-chip mapa-categoria-chip--mais"
            onClick={() => setMostrarExtras((v) => !v)}
            title="Mais categorias"
          >
            <i className={`bi ${mostrarExtras ? 'bi-x-lg' : 'bi-three-dots'}`}></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Mapa