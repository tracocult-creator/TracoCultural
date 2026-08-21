import React, { useState } from 'react'
import { registrarCompartilhamento } from '../servicos/api'
import { useAuth } from '../contexts/AuthContext'

/**
 * Botão de compartilhar evento. Usa a Web Share API nativa quando
 * disponível (mobile/Chrome/Edge); cai pra copiar link no clipboard
 * em navegadores sem suporte (ex: Firefox desktop, Safari antigo).
 * Se o usuário estiver logado, registra o compartilhamento no backend
 * (contador da entidade Compartilhamento, que antes não era usada
 * em lugar nenhum).
 */
const ShareButton = ({ evento, className = 'event-fav-btn', stopPropagation = false }) => {
  const { user } = useAuth()
  const [copiado, setCopiado] = useState(false)

  const handleShare = async (e) => {
    if (stopPropagation) e.stopPropagation()

    const url = `${window.location.origin}/eventos/${evento.id}`
    const shareData = {
      title: evento.nome,
      text: `Dá uma olhada nesse evento: ${evento.nome}`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
      if (user) {
        registrarCompartilhamento(evento.id).catch(() => {})
      }
    } catch {
      // usuário cancelou o share nativo — não é erro, ignora
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleShare}
      title="Compartilhar evento"
    >
      <i className={copiado ? 'bi bi-check-lg' : 'bi bi-share-fill'}></i>
    </button>
  )
}

export default ShareButton
