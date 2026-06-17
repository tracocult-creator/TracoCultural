import React, { useState, useEffect } from 'react'
import api from '../servicos/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../componentes/Navbar'
import '../estilos/ProfilePage.css'

const icones = [
  'airplane-fill', 'backpack2-fill', 'bag-heart-fill', 'balloon-fill', 'bank2',
  'basket3-fill', 'bicycle', 'binoculars-fill', 'book-half', 'brightness-alt-high-fill',
  'bug-fill', 'brush-fill', 'bus-front', 'cake-fill', 'camera-fill', 'car-front-fill',
  'cassette-fill', 'cloud-rain-fill', 'cup-hot-fill', 'cup-straw', 'earbuds',
  'egg-fried', 'emoji-wink-fill', 'emoji-tear-fill', 'emoji-sunglasses-fill',
  'eyeglasses', 'flower3', 'fork-knife', 'gear-wide-connected', 'hearts',
  'moon-stars-fill', 'person-arms-up', 'person-standing', 'person-standing-dress',
  'person-wheelchair', 'piggy-bank-fill', 'rocket-takeoff-fill',
]

const cores = [
  '#8E5E56', '#2ecc71', '#3498db', '#9b59b6', '#f39c12',
  '#5bb144ff', '#cc2e68ff', '#cc2222ff', '#d0ca22ff', '#2d2a26ff',
  '#391f1bff', '#cc6217ff', '#34db90ff', '#76148cff', '#eea6c0ff',
]

const estados = ['SP', 'RJ', 'MG', 'RS', 'BA', 'PR', 'SC', 'PE', 'DF']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Perfil = () => {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editProfile, setEditProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [aba, setAba] = useState('dados')
  const [loading, setLoading] = useState(false)
  const [userEvents, setUserEvents] = useState([])
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [erroSenha, setErroSenha] = useState('')

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

    api.get('/eventos/meus')
      .then(({ data }) => setUserEvents(data))
      .catch(() => setUserEvents([]))
  }, [user])

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
      const { data } = await api.put(`/usuarios/${profile.id}`, editProfile)
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
            <div className="profile-avatar" style={{ backgroundColor: profile.corFundo }}>
              <i className={`bi bi-${profile.icone}`}></i>
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{profile.nome}</h3>
              <p className="profile-email">{profile.email}</p>
              <p className="profile-location">📍 {profile.estado}</p>
            </div>
            <button className="btn-edit-profile" onClick={abrirModal}>
              <i className="bi bi-pencil"></i> Editar
            </button>
          </div>
          <div className="profile-stats">
            <div>
              <strong>{userEvents.length}</strong>
              <span>eventos criados</span>
            </div>
            <div>
              <strong>{profile.estado}</strong>
              <span>estado</span>
            </div>
          </div>
        </div>

        <section className="user-events-section">
          <h3 className="user-events-title">Meus Eventos</h3>
          {userEvents.length > 0 ? (
            <div className="user-events-grid">
              {userEvents.map((evento) => (
                <div className="event-card" key={evento.id}>
                  {evento.cardImage ? (
                    <img src={`data:image/jpeg;base64,${evento.cardImage}`} alt={evento.nome} className="event-image" />
                  ) : (
                    <div className="event-image event-image--empty">
                      <i className="bi bi-image"></i>
                    </div>
                  )}
                  <div className="event-content">
                    <h3 className="event-title">{evento.nome}</h3>
                    <p className="event-date">📅 {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}</p>
                    <p className="event-location">📍 {evento.cidade}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">Você ainda não criou nenhum evento.</p>
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

                  <label>Estado:</label>
                  <select value={editProfile.estado || 'SP'} onChange={(e) => setEditProfile({ ...editProfile, estado: e.target.value })}>
                    {estados.map((e) => <option key={e}>{e}</option>)}
                  </select>

                  <label>Ícone:</label>
                  <div className="icon-grid">
                    {icones.map((i) => (
                      <div key={i} className={`icon-option ${editProfile.icone === i ? 'selected' : ''}`} onClick={() => setEditProfile({ ...editProfile, icone: i })}>
                        <i className={`bi bi-${i}`}></i>
                      </div>
                    ))}
                  </div>

                  <label>Cor:</label>
                  <div className="color-grid">
                    {cores.map((c) => (
                      <div key={c} className={`color-option ${editProfile.corFundo === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => setEditProfile({ ...editProfile, corFundo: c })} />
                    ))}
                  </div>

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
      </main>
    </div>
  )
}

export default Perfil
