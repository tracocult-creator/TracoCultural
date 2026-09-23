import { useEffect, useState } from 'react'
import { ufPorNomeEstado } from '../constants/estados'

/**
 * Descobre a localização real do usuário: pede permissão de geolocalização
 * do navegador e faz reverse geocoding (Nominatim, mesmo serviço usado no
 * MapaEventos) pra extrair a cidade e o UF de onde ele está.
 *
 * Não existe nenhuma localização padrão/fixa aqui — se a permissão for
 * negada, o navegador não suportar geolocalização, ou a busca falhar,
 * tudo fica `null` e quem consome o hook decide o que fazer (esconder a
 * seção, mostrar um aviso, etc.), igual ao mobile.
 */
export function useGeoLocation() {
  const [state, setState] = useState({
    city: null,
    uf: null,
    loading: true,
    denied: false,
  })

  useEffect(() => {
    let cancelado = false

    if (!('geolocation' in navigator)) {
      setState({ city: null, uf: null, loading: false, denied: true })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const resposta = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const dados = await resposta.json()
          const endereco = dados?.address || {}
          const cidade =
            endereco.city || endereco.town || endereco.village || endereco.municipality || null
          const uf = ufPorNomeEstado(endereco.state)

          if (!cancelado) setState({ city: cidade, uf, loading: false, denied: false })
        } catch {
          if (!cancelado) setState({ city: null, uf: null, loading: false, denied: true })
        }
      },
      () => {
        if (!cancelado) setState({ city: null, uf: null, loading: false, denied: true })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )

    return () => {
      cancelado = true
    }
  }, [])

  return state
}
