import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { excluirEvento } from '../servicos/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../componentes/Navbar'
import ConfirmModal from '../componentes/ConfirmModal'
import EditarEventoModal from '../componentes/EditarEventoModal'
import ShareButton from '../componentes/ShareButton'
import { isEventoEncerrado } from '../utils/text'
import '../estilos/ProfilePage.css'
import '../estilos/HomePage.css' // reaproveita .event-actions-row / .event-fav-btn / .event-encerrado-badge
import '../estilos/Modal.css'

const estados = ['SP', 'RJ', 'MG', 'RS', 'BA', 'PR', 'SC', 'PE', 'DF']
const NOMES_ESTADOS = {
  SP: 'São Paulo', RJ: 'Rio de Janeiro', MG: 'Minas Gerais', RS: 'Rio Grande do Sul',
  BA: 'Bahia', PR: 'Paraná', SC: 'Santa Catarina', PE: 'Pernambuco', DF: 'Distrito Federal',
}
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

  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [erroSenha, setErroSenha] = useState('')

  const [editingEvento, setEditingEvento] = useState(null)
  const [deletingEvento, setDeletingEvento] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (!user) return
    const base = {
      ...user,
      estado: user.estado || 'SP',
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

  const handleSaveSenha = async () => {
    if (senhaForm.novaSenha.length < 8) { setErroSenha('Nova senha deve ter no mínimo 8 caracteres.'); return }
    if (senhaForm.novaSenha !== senhaForm.confirmar) { setErroSenha('As senhas não coincidem.'); return }
    setErroSenha('')
    setLoading(true)
    try {
      await api.patch(`/usuarios/${profile.id}/senha`, {
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha,
      })
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' })
      mostrarSucesso()
    } catch (err) {
      setErroSenha(err.response?.data?.message || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = () => {
    setErro('')
    setErroSenha('')
    setSucesso(false)
    setAba('dados')
    setEditProfile({ ...profile })
    setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' })
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
                📍 {NOMES_ESTADOS[profile.estado] || profile.estado}
                {NOMES_ESTADOS[profile.estado] && ` (${profile.estado})`}
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

                      {encerrado && <span className="event-encerrado-badge">Encerrado</span>}

                      <div className="event-actions-row">
                        <ShareButton evento={evento} stopPropagation />
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

                  <label>Senha atual:</label>
                  <input type="password" value={senhaForm.senhaAtual} onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })} placeholder="••••••••" />

                  <label>Nova senha:</label>
                  <input type="password" value={senhaForm.novaSenha} onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })} placeholder="Mínimo 8 caracteres" />

                  <label>Confirmar nova senha:</label>
                  <input type="password" value={senhaForm.confirmar} onChange={(e) => setSenhaForm({ ...senhaForm, confirmar: e.target.value })} placeholder="Repita a nova senha" />

                  <div className="modal-actions">
                    <button onClick={handleSaveSenha} disabled={loading}>{loading ? 'Salvando...' : 'Alterar senha'}</button>
                    <button onClick={() => setIsEditing(false)} disabled={loading}>Cancelar</button>
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
