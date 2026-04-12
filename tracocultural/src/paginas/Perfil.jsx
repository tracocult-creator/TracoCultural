import React, { useState, useEffect } from 'react'
import Navbar from '../componentes/Navbar'
import '../estilos/ProfilePage.css'
import { useAuth } from '../contexts/AuthContext'

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

const Perfil = () => {
  const { user, login } = useAuth()
  const [editProfile, setEditProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const profile = user
    ? { estado: 'SP', icone: 'person-standing', corFundo: '#8E5E56', ...user }
    : null

  useEffect(() => {
    if (user) setEditProfile({ estado: 'SP', icone: 'person-standing', corFundo: '#8E5E56', ...user })
  }, [user])

  const handleSave = () => {
    setErro('')
    setSucesso('')
    if (!editProfile.nome?.trim()) return setErro('Nome não pode ser vazio.')
    if (!editProfile.email?.trim()) return setErro('Email não pode ser vazio.')
    login(editProfile)
    setSucesso('Perfil atualizado com sucesso!')
    setIsEditing(false)
  }

  if (!profile) return <div>Carregando...</div>

  return (
    <div className="profile-page">
      <Navbar />

      <section className="title-section">
        <h2 className="main-title">Meu Perfil</h2>
      </section>

      <main className="profile-content">
        {sucesso && (
          <p style={{ color: '#2e7d32', background: 'rgba(255,255,255,0.9)', padding: '0.8rem 1.5rem', borderRadius: '10px', marginBottom: '1rem', maxWidth: '450px', margin: '0 auto 1rem' }}>
            {sucesso}
          </p>
        )}

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
            <button className="btn-edit-profile" onClick={() => { setErro(''); setSucesso(''); setIsEditing(true) }}>
              <i className="bi bi-pencil"></i> Editar
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h3>Editar Perfil</h3>
              {erro && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{erro}</p>}

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
                <button onClick={handleSave}>Salvar</button>
                <button onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Perfil
