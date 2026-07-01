import React, { useEffect, useState } from 'react'
import api from '../../servicos/api'

const CATEGORIAS = [
  'Social','Musica','Cultura & Arte','Profissional','Educacao',
  'Tecnologia','Bem-Estar','Esporte','Gastronomia','Comercio',
  'Kids','Religioso','Comunidade','Geek','Viagem',
]

const empty = { nome: '', descricao: '', cidade: '', dataInicio: '', dataFim: '', linkExterno: '' }

const EventosAdmin = ({ showToast }) => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const carregar = () => {
    setLoading(true)
    api.get('/admin/eventos')
      .then(({ data }) => setEventos(data))
      .catch(() => showToast('Erro ao carregar eventos.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirEditar = (ev) => {
    setForm({
      nome: ev.nome || '',
      descricao: ev.descricao || '',
      cidade: ev.cidade || '',
      dataInicio: ev.dataInicio ? ev.dataInicio.slice(0, 16) : '',
      dataFim: ev.dataFim ? ev.dataFim.slice(0, 16) : '',
      linkExterno: ev.linkExterno || '',
    })
    setEditTarget(ev)
  }

  const salvar = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
      }
      await api.put(`/admin/eventos/${editTarget.id}`, payload)
      showToast('Evento atualizado!', 'success')
      setEditTarget(null)
      carregar()
    } catch { showToast('Erro ao salvar evento.', 'error') }
    finally { setSaving(false) }
  }

  const deletar = async (id) => {
    try {
      await api.delete(`/admin/eventos/${id}`)
      showToast('Evento excluído.', 'success')
      setConfirmDelete(null)
      carregar()
    } catch { showToast('Erro ao excluir evento.', 'error') }
  }

  const destacar = async (id) => {
    try {
      await api.patch(`/admin/eventos/${id}/destacar`)
      showToast('Destaque atualizado!', 'success')
      carregar()
    } catch { showToast('Erro ao destacar evento.', 'error') }
  }

  const patrocinar = async (id) => {
    try {
      await api.patch(`/admin/eventos/${id}/patrocinar`)
      showToast('Patrocínio atualizado!', 'success')
      carregar()
    } catch { showToast('Erro ao patrocinar evento.', 'error') }
  }

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Gestão de Eventos</h2>
      </div>

      {loading ? (
        <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Categoria</th>
                <th>Cidade</th>
                <th>Criador</th>
                <th>Destaque</th>
                <th>Patrocinado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr><td colSpan={7} className="admin-table-empty">Nenhum evento encontrado.</td></tr>
              ) : eventos.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</td>
                  <td>{ev.categoria?.nome || '—'}</td>
                  <td>{ev.cidade}</td>
                  <td>{ev.usuario?.nome || ev.nomeUsuario || '—'}</td>
                  <td>
                    <span className={`admin-badge ${ev.destacado ? 'admin-badge--amber' : 'admin-badge--gray'}`}>
                      {ev.destacado ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${ev.patrocinado ? 'admin-badge--green' : 'admin-badge--gray'}`}>
                      {ev.patrocinado ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--primary" onClick={() => abrirEditar(ev)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="admin-btn admin-btn--amber" style={{ background: 'rgba(212,163,115,.15)', color: '#d4a373', border: '1px solid rgba(212,163,115,.3)' }} onClick={() => destacar(ev.id)}>
                        <i className="bi bi-star"></i>
                      </button>
                      <button className="admin-btn admin-btn--success" onClick={() => patrocinar(ev.id)}>
                        <i className="bi bi-award"></i>
                      </button>
                      <button className="admin-btn admin-btn--danger" onClick={() => setConfirmDelete(ev)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar */}
      {editTarget && (
        <div className="admin-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Editar Evento</h3>
              <button className="admin-modal-close" onClick={() => setEditTarget(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label>Nome</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Cidade</label>
                <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-field">
                  <label>Início</label>
                  <input type="datetime-local" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Término</label>
                  <input type="datetime-local" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label>Link Externo</label>
                <input type="url" value={form.linkExterno} onChange={(e) => setForm({ ...form, linkExterno: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--neutral" onClick={() => setEditTarget(null)}>Cancelar</button>
              <button className="admin-btn admin-btn--primary" onClick={salvar} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Delete */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Excluir Evento</h3>
              <button className="admin-modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">Tem certeza que deseja excluir <strong>{confirmDelete.nome}</strong>? Esta ação é irreversível.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--neutral" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="admin-btn admin-btn--danger" onClick={() => deletar(confirmDelete.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventosAdmin
