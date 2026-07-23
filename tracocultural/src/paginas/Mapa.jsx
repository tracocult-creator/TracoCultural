import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import { getEventos } from '../servicos/api'
import 'leaflet/dist/leaflet.css'
import '../estilos/Mapa.css'

import iconeMarcador from 'leaflet/dist/images/marker-icon.png'
import iconeMarcadorSombra from 'leaflet/dist/images/marker-shadow.png'
import iconeMarcador2x from 'leaflet/dist/images/marker-icon-2x.png'

const iconeEvento = new L.Icon({
  iconUrl: iconeMarcador,
  iconRetinaUrl: iconeMarcador2x,
  shadowUrl: iconeMarcadorSombra,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
// de um layout flexível (o mapa mede o tamanho antes da hora)
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

const Mapa = () => {
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
    <div className="mapa-page">
      <Navbar />

      <div className="mapa-header">
        <h2>Eventos perto de você</h2>
        <p>
          {carregando
            ? 'Carregando eventos no mapa...'
            : `${marcadoresEventos.length} evento(s) localizado(s)`}
        </p>
        {erroLocalizacao && <p className="mapa-aviso">{erroLocalizacao}</p>}
      </div>

      <div className="mapa-container">
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
              <Popup>Você está aqui</Popup>
            </Marker>
          )}

          {marcadoresEventos.map((evento) => (
            <Marker key={evento.id} position={evento.coords} icon={iconeEvento}>
              <Popup>
                <strong>{evento.nome}</strong>
                <br />
                {evento.cidade}
                <br />
                <button
                  className="mapa-popup-btn"
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                >
                  Ver detalhes
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default Mapa