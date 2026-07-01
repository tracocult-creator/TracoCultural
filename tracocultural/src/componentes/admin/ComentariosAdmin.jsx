import React, { useEffect, useState } from 'react'
import api from '../../servicos/api'

const ComentariosAdmin = ({ showToast }) => {
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const carregar = () => {
    setLoading(true)
    api.get('/admin/comentarios')
      .then(({ data }) => setComentarios(data))
      .catch(() => showToast('Erro ao carregar comentários.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const deletar = async (id) => {
    try {
      await api.delete(`/admin/comentarios/${id}`)
      showToast('Comentário excluído.', 'success')
      setConfirmDelete(null)
      carregar()
    } catch { showToast('Erro ao excluir comentário.', 'error') }
  }

  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Gestão de Comentários</h2>
      </div>

      {loading ? (
        <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Evento</th>
                <th>Comentário</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-empty">Nenhum comentário encontrado.</td></tr>
              ) : comentarios.map((c) => (
                <tr key={c.id}>
                  <td>{c.nomeUsuario || c.usuario?.nome || '—'}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.nomeEvento || c.evento?.nome || '—'}
                  </td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.texto}
                  </td>
                  <td>{formatarData(c.dataCriacao || c.criadoEm)}</td>
                  <td>
                    <button className="admin-btn admin-btn--danger" onClick={() => setConfirmDelete(c)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Excluir Comentário</h3>
              <button className="admin-modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">Excluir o comentário de <strong>{confirmDelete.nomeUsuario || 'usuário'}</strong>? Esta ação é irreversível.</p>
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

export default ComentariosAdmin
