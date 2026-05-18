import React, { useState, useEffect } from 'react';
import api from '../servicos/services/api';
import Navbar from '../componentes/Navbar';
import '../estilos/ProfilePage.css';

const Perfil = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEvents, setUserEvents] = useState([]);

  const icones = ['airplane-fill', 'backpack2-fill', 'bag-heart-fill', 'balloon-fill', 'bank2',
    'basket3-fill', 'bicycle', 'binoculars-fill', 'book-half', 'brightness-alt-high-fill',
    'bug-fill', 'brush-fill', 'bus-front', 'cake-fill', 'camera-fill', 'car-front-fill',
    'cassette-fill', 'cloud-rain-fill', 'cup-hot-fill', 'cup-straw', 'earbuds',
    'egg-fried', 'emoji-wink-fill', 'emoji-tear-fill', 'emoji-sunglasses-fill',
    'eyeglasses', 'flower3', 'fork-knife', 'gear-wide-connected', 'hearts',
    'moon-stars-fill', 'person-arms-up', 'person-standing', 'person-standing-dress',
    'person-wheelchair', 'piggy-bank-fill', 'rocket-takeoff-fill'];
  const cores = ['#8E5E56', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', 
    '#5bb144ff', '#cc2e68ff', '#cc2222ff', '#d0ca22ff', '#2d2a26ff', '#391f1bff',
     '#cc6217ff', '#34db90ff', '#76148cff', '#eea6c0ff'];
  const estados = ['SP', 'RJ', 'MG', 'RS', 'BA', 'PR', 'SC', 'PE', 'DF'];

  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        estado: user.estado || 'SP',
        icone: user.icone || 'person-standing',
        corFundo: user.corFundo || '#8E5E56',
      });
      setEditProfile({
        ...user,
        estado: user.estado || 'SP',
        icone: user.icone || 'person-standing',
        corFundo: user.corFundo || '#8E5E56',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/eventos/usuario/${user.id}`)
        .then((res) => setUserEvents(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    if (!profile?.id) {
      alert('Usuário inválido.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/usuarios/${profile.id}`, editProfile);
      setProfile(response.data);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Carregando...</div>;

  return (
    <div className="profile-page">
      <Navbar onLogout={onLogout} />

      <section className="title-section">
        <h2 className="main-title">Meu Perfil</h2>
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
            <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
              <i className="bi bi-pencil"></i> Editar
            </button>
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
                    <div className="event-image" style={{ background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
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
              <h3>Editar Perfil</h3>

              <label>Nome:</label>
              <input
                type="text"
                value={editProfile.nome}
                onChange={(e) => setEditProfile({ ...editProfile, nome: e.target.value })}
              />

              <label>Email:</label>
              <input
                type="email"
                value={editProfile.email}
                onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
              />

              <label>Estado:</label>
              <select
                value={editProfile.estado}
                onChange={(e) => setEditProfile({ ...editProfile, estado: e.target.value })}
              >
                {estados.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>

              <label>Ícone:</label>
              <div className="icon-grid">
                {icones.map((i) => (
                  <div
                    key={i}
                    className={`icon-option ${editProfile.icone === i ? 'selected' : ''}`}
                    onClick={() => setEditProfile({ ...editProfile, icone: i })}
                  >
                    <i className={`bi bi-${i}`}></i>
                  </div>
                ))}
              </div>

              <label>Cor:</label>
              <div className="color-grid">
                {cores.map((c) => (
                  <div
                    key={c}
                    className={`color-option ${editProfile.corFundo === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditProfile({ ...editProfile, corFundo: c })}
                  ></div>
                ))}
              </div>

              <div className="modal-actions">
                <button onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setIsEditing(false)} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Perfil;
