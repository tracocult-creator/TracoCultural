import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { getEventos } from '../servicos/api'
import 'leaflet/dist/leaflet.css'
import '../estilos/Mapa.css'

// Pino do evento: gota dourada com um pontinho branco no meio,
// no lugar do pin azul padrão do Leaflet
const iconeEvento = new L.DivIcon({
  className: 'marcador-evento',
  html: `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 45C17 45 32 27.5 32 17C32 7.6 25.3 1 17 1C8.7 1 2 7.6 2 17C2 27.5 17 45 17 45Z"
            fill="url(#gradEvento)" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="17" cy="17" r="6" fill="#ffffff"/>
      <defs>
        <linearGradient id="gradEvento" x1="0" y1="0" x2="34" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#D4A373"/>
          <stop offset="1" stop-color="#B8864E"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  iconSize: [34, 46],
  iconAnchor: [17, 44],
  popupAnchor: [0, -42],
})

const iconeVoce = new L.DivIcon({
  className: 'marcador-voce',
  html: '<div class="marcador-voce-ponto"><i class="bi bi-person-fill"></i></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

const CENTRO_PADRAO = [-14.235, -51.9253] // centro aproximado do Brasil

const cacheCidades = {}

async function geocodificarCidade(cidade) {
  if (!cidade) return null
  if (cacheCidades[cidade]) return cacheCidades[cidade]

  try {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cidade + ', Brasil')}`
    )
    const dados = await resposta.json()
    if (dados && dados.length > 0) {
      const coords = [parseFloat(dados[0].lat), parseFloat(dados[0].lon)]
      cacheCidades[cidade] = coords
      return coords
    }
  } catch (err) {
    console.error('Erro ao geocodificar cidade:', cidade, err)
  }
  return null
}

function RecentralizarMapa({ posicao }) {
  const map = useMap()
  useEffect(() => {
    if (posicao) {
      map.setView(posicao, 11)
    }
  }, [posicao, map])
  return null
}

// Corrige o bug comum do Leaflet ficar "em branco" quando nasce dentro
// de um layout flexível ou dentro de um modal (o mapa mede o tamanho
// antes da hora / antes do overlay estar totalmente visível)
function CorrigirTamanhoMapa() {
  const map = useMap()
  useEffect(() => {
    const corrigir = () => map.invalidateSize()
    corrigir()
    const t1 = setTimeout(corrigir, 100)
    const t2 = setTimeout(corrigir, 500)
    window.addEventListener('resize', corrigir)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', corrigir)
    }
  }, [map])
  return null
}

/**
 * Componente autocontido do mapa de eventos: geolocalização, geocodificação
 * de cidades e renderização dos marcadores. Não inclui Navbar nem título,
 * de propósito — assim pode ser usado tanto na página /mapa quanto dentro
 * de um modal (ex: botão "Ver no mapa" na Home).
 */
const MapaEventos = ({ altura = '65vh', dentroModal = false }) => {
  const navigate = useNavigate()
  const [posicaoUsuario, setPosicaoUsuario] = useState(null)
  const [erroLocalizacao, setErroLocalizacao] = useState('')
  const [marcadoresEventos, setMarcadoresEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const jaGeocodificou = useRef(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setErroLocalizacao('Seu navegador não suporta localização.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicaoUsuario([pos.coords.latitude, pos.coords.longitude])
      },
      () => {
        setErroLocalizacao('Não conseguimos acessar sua localização. Mostrando o mapa do Brasil.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  useEffect(() => {
    if (jaGeocodificou.current) return
    jaGeocodificou.current = true

    const carregarEventos = async () => {
      try {
        const { data } = await getEventos()

        const marcadores = []
        for (const evento of data) {
          const coords = await geocodificarCidade(evento.cidade)
          if (coords) {
            marcadores.push({ ...evento, coords })
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        setMarcadoresEventos(marcadores)
      } catch (err) {
        console.error('Erro ao carregar eventos para o mapa:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarEventos()
  }, [])

  return (
    <div className={`mapa-eventos-wrapper${dentroModal ? ' mapa-eventos-wrapper--modal' : ''}`}>
      <div className="mapa-eventos-status">
        <span>
          {carregando
            ? 'Carregando eventos no mapa...'
            : `${marcadoresEventos.length} evento(s) localizado(s)`}
        </span>
        {erroLocalizacao && <span className="mapa-aviso">{erroLocalizacao}</span>}
      </div>

      <div
        className={`mapa-container mapa-container--tema${dentroModal ? ' mapa-container--modal' : ''}`}
        style={{ height: altura }}
      >
        <MapContainer
          center={posicaoUsuario || CENTRO_PADRAO}
          zoom={posicaoUsuario ? 11 : 4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          {posicaoUsuario && <RecentralizarMapa posicao={posicaoUsuario} />}
          <CorrigirTamanhoMapa />

          {posicaoUsuario && (
            <Marker position={posicaoUsuario} icon={iconeVoce}>
              <Popup className="popup-evento">Você está aqui</Popup>
            </Marker>
          )}

          {marcadoresEventos.map((evento) => (
            <Marker key={evento.id} position={evento.coords} icon={iconeEvento}>
              <Popup className="popup-evento">
                <div className="popup-evento-conteudo">
                  <span className="popup-evento-categoria">
                    {evento.categoria?.nome || 'Evento'}
                  </span>
                  <strong className="popup-evento-titulo">{evento.nome}</strong>
                  <span className="popup-evento-cidade">
                    <i className="bi bi-geo-alt-fill"></i> {evento.cidade}
                  </span>
                  <button
                    className="mapa-popup-btn"
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapaEventos