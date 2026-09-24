import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { excluirEvento, esqueciSenha } from '../servicos/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../componentes/Navbar'
import ConfirmModal from '../componentes/ConfirmModal'
import EditarEventoModal from '../componentes/EditarEventoModal'
import NotificarFavoritosModal from '../componentes/NotificarFavoritosModal'
import ShareButton from '../componentes/ShareButton'
import { isEventoEncerrado, diasAteRemocao } from '../utils/text'
import { useGeoLocation } from '../hooks/useGeoLocation'
import { NOMES_ESTADOS } from '../constants/estados'
import '../estilos/ProfilePage.css'
import '../estilos/HomePage.css' // reaproveita .event-actions-row / .event-fav-btn / .event-encerrado-badge
import '../estilos/Modal.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const primeiraLetra = (nome) => (nome || '?')[0].toUpperCase()

const Perfil = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [editProfile, setEditProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [aba, setAba] = useState('dados')
  const [loading, setLoading] = useState(false)
  const [userEvents, setUserEvents] = useState([])
  const [userFavoritos, setUserFavoritos] = useState([])
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [erroSenha, setErroSenha] = useState('')
  const [enviandoCodigo, setEnviandoCodigo] = useState(false)

  const [editingEvento, setEditingEvento] = useState(null)
  const [notifyingEvento, setNotifyingEvento] = useState(null)
  const [deletingEvento, setDeletingEvento] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  // Não existe estado predefinido (ex.: SP) — se o usuário ainda não tem
  // um estado salvo, tentamos descobrir o real via geolocalização do
  // navegador (mesma lógica usada em "eventos perto de você").
  const { uf: ufDetectado } = useGeoLocation()

  useEffect(() => {
    if (!user) return
    const base = {
      ...user,
      estado: user.estado || null,
      icone: user.icone || 'person-standing',
      corFundo: user.corFundo || '#8E5E56',
    }
    setProfile(base)
    setEditProfile(base)

    carregarMeusEventos()

    api.get('/favoritos')
      .then(({ data }) => setUserFavoritos(Array.isArray(data) ? data : []))
      .catch(() => setUserFavoritos([]))
  }, [user])

  // Assim que a geolocalização devolve o UF real, preenche o perfil de
  // quem ainda não tinha estado salvo (e persiste, sem precisar que o
  // usuário abra o modal de edição pra isso).
  useEffect(() => {
    if (!profile || profile.estado || !ufDetectado) return
    setProfile((prev) => ({ ...prev, estado: ufDetectado }))
    setEditProfile((prev) => ({ ...prev, estado: ufDetectado }))
    api.put(`/usuarios/${profile.id}`, { ...profile, estado: ufDetectado }).catch(() => {})
  }, [profile, ufDetectado])

  const carregarMeusEventos = () => {
    api.get('/eventos/meus')
      .then(({ data }) => setUserEvents(data))
      .catch(() => setUserEvents([]))
  }

  const mostrarSucesso = (fechar = true) => {
    setSucesso(true)
    setTimeout(() => {
      setSucesso(false)
      if (fechar) setIsEditing(false)
    }, 3000)
  }

  const handleSaveDados = async () => {
    if (!editProfile.nome?.trim()) { setErro('Nome é obrigatório.'); return }
    if (!EMAIL_RE.test(editProfile.email)) { setErro('Email inválido.'); return }
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.put(`/usuarios/${profile.id}`, {
        nome: editProfile.nome,
        email: editProfile.email,
      })
      setProfile(data)
      login(data)
      mostrarSucesso()
    } catch {
      setErro('Erro ao salvar alterações.')
    } finally {
      setLoading(false)
    }
  }



  const handleEsqueciSenha = async () => {
    if (!profile?.email) return
    setErroSenha('')
    setEnviandoCodigo(true)
    try {
      await esqueciSenha(profile.email)
      navigate('/redefinir-senha', { state: { email: profile.email } })
    } catch (err) {
      setErroSenha(err.response?.data?.message || 'Erro ao enviar o código de redefinição. Tente novamente.')
    } finally {
      setEnviandoCodigo(false)
    }
  }

  const abrirModal = () => {
    setErro('')
    setErroSenha('')
    setSucesso(false)
    setAba('dados')
    setEditProfile({ ...profile })
    setIsEditing(true)
  }

  const handleEventoSalvo = (eventoAtualizado) => {
    setUserEvents((prev) => prev.map((e) => (e.id === eventoAtualizado.id ? { ...e, ...eventoAtualizado } : e)))
    setEditingEvento(null)
  }

  const handleConfirmarExclusao = async () => {
    if (!deletingEvento) return
    setExcluindo(true)
    try {
      await excluirEvento(deletingEvento.id)
      setUserEvents((prev) => prev.filter((e) => e.id !== deletingEvento.id))
      setDeletingEvento(null)
    } catch {
      alert('Erro ao excluir evento. Tente novamente.')
    } finally {
      setExcluindo(false)
    }
  }

  if (!profile) return <div>Carregando...</div>

  return (
    <div className="profile-page">
      <Navbar />

      <section className="title-section">
        <div>
          <span className="page-eyebrow">Sua conta</span>
          <h2 className="main-title">Meu Perfil</h2>
          <p className="page-subtitle">Gerencie sua identidade no Traço Cultural e acompanhe os eventos publicados.</p>
        </div>
      </section>

      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <button
              type="button"
              className="profile-avatar profile-avatar--editavel"
              onClick={abrirModal}
              title="Editar perfil"
            >
              {primeiraLetra(profile.nome)}
              <span className="profile-avatar-overlay">
                <i className="bi bi-pencil-fill"></i>
              </span>
            </button>
            <div className="profile-info">
              <h3 className="profile-name">{profile.nome}</h3>
              <p className="profile-email">{profile.email}</p>
              <p className="profile-location">
                📍 {profile.estado
                  ? `${NOMES_ESTADOS[profile.estado] || profile.estado}${NOMES_ESTADOS[profile.estado] ? ` (${profile.estado})` : ''}`
                  : 'Localização não detectada'}
              </p>
            </div>
            <button className="btn-edit-profile" onClick={abrirModal}>
              <i className="bi bi-pencil"></i> Editar
            </button>
          </div>
          <div className="profile-stats">
            <div>
              <i className="bi bi-calendar-event"></i>
              <strong>{userEvents.length}</strong>
              <span>eventos criados</span>
            </div>
            <div>
              <i className="bi bi-heart-fill"></i>
              <strong>{userFavoritos.length}</strong>
              <span>favoritos salvos</span>
            </div>
          </div>
        </div>

        <section className="user-events-section">
          <h3 className="user-events-title">Meus Eventos</h3>
          {userEvents.length > 0 ? (
            <div className="user-events-grid">
              {userEvents.map((evento) => {
                const encerrado = isEventoEncerrado(evento)
                return (
                  <div
                    className={`event-card${encerrado ? ' event-card--encerrado' : ''}`}
                    key={evento.id}
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                  >
                    <div className="event-image-wrapper">
                      {evento.cardImage ? (
                        <img src={`data:image/jpeg;base64,${evento.cardImage}`} alt={evento.nome} className="event-image" />
                      ) : (
                        <div className="event-image event-image--empty">
                          <i className="bi bi-image"></i>
                        </div>
                      )}

                      {encerrado && (
                        <span className="event-encerrado-badge">
                          Encerrado{typeof diasAteRemocao(evento) === 'number' && ` · some em ${diasAteRemocao(evento)}d`}
                        </span>
                      )}

                      <div className="event-actions-row">
                        <ShareButton evento={evento} stopPropagation />
                        <button
                          className="event-fav-btn"
                          title="Notificar quem favoritou"
                          onClick={(e) => { e.stopPropagation(); setNotifyingEvento(evento) }}
                        >
                          <i className="bi bi-bell-fill"></i>
                        </button>
                        <button
                          className="event-fav-btn"
                          title="Editar evento"
                          onClick={(e) => { e.stopPropagation(); setEditingEvento(evento) }}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="event-fav-btn event-fav-btn--danger"
                          title="Excluir evento"
                          onClick={(e) => { e.stopPropagation(); setDeletingEvento(evento) }}
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </div>
                    <div className="event-content">
                      <h3 className="event-title">{evento.nome}</h3>
                      <p className="event-date">📅 {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}</p>
                      <p className="event-location">📍 {evento.cidade}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="no-events">
              <i className="bi bi-calendar-plus"></i>
              <p>Você ainda não criou nenhum evento.</p>
              <button className="btn-criar-primeiro-evento" onClick={() => navigate('/criar-evento')}>
                <i className="bi bi-plus-lg"></i> Criar meu primeiro evento
              </button>
            </div>
          )}
        </section>

        {isEditing && (
          <div className="modal-overlay">
            <div className="edit-modal">
              {sucesso && <div className="modal-sucesso-bar">Salvo com sucesso!</div>}
              <h3>Editar Perfil</h3>

              <div className="modal-abas">
                <button className={`modal-aba ${aba === 'dados' ? 'modal-aba--ativa' : ''}`} onClick={() => { setAba('dados'); setErro('') }}>Dados do Perfil</button>
                <button className={`modal-aba ${aba === 'senha' ? 'modal-aba--ativa' : ''}`} onClick={() => { setAba('senha'); setErroSenha('') }}>Alterar Senha</button>
              </div>

              {aba === 'dados' && (
                <>
                  {erro && <p className="profile-alert profile-alert--error" style={{ margin: '0 1.5rem .5rem' }}>{erro}</p>}

                  <label>Nome:</label>
                  <input type="text" value={editProfile.nome || ''} onChange={(e) => setEditProfile({ ...editProfile, nome: e.target.value })} />

                  <label>Email:</label>
                  <input type="email" value={editProfile.email || ''} onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })} />

                  <div className="modal-actions">
                    <button onClick={handleSaveDados} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
                    <button onClick={() => setIsEditing(false)} disabled={loading}>Cancelar</button>
                  </div>
                </>
              )}

              {aba === 'senha' && (
                <>
                  {erroSenha && <p className="profile-alert profile-alert--error" style={{ margin: '0 1.5rem .5rem' }}>{erroSenha}</p>}

                  <p style={{ margin: '0 0 1rem' }}>
                    Enviaremos um código de confirmação para o seu e-mail antes de definir uma nova senha.
                  </p>

                  <div className="modal-actions">
                    <button onClick={handleEsqueciSenha} disabled={enviandoCodigo}>
                      {enviandoCodigo ? 'Enviando código…' : 'Redefinir senha'}
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={enviandoCodigo}>Cancelar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {editingEvento && (
          <EditarEventoModal
            evento={editingEvento}
            onClose={() => setEditingEvento(null)}
            onSalvo={handleEventoSalvo}
          />
        )}

        {notifyingEvento && (
          <NotificarFavoritosModal
            evento={notifyingEvento}
            onClose={() => setNotifyingEvento(null)}
          />
        )}

        {deletingEvento && (
          <ConfirmModal
            title="Excluir este evento?"
            message={`"${deletingEvento.nome}" será removido permanentemente, junto com favoritos e comentários associados.`}
            confirmLabel="Excluir evento"
            loading={excluindo}
            onConfirm={handleConfirmarExclusao}
            onCancel={() => setDeletingEvento(null)}
          />
        )}
      </main>
    </div>
  )
}

export default Perfil