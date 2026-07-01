import React, { useEffect, useState } from 'react'
import api from '../../servicos/api'

const UsuariosAdmin = ({ showToast }) => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const carregar = () => {
    setLoading(true)
    api.get('/admin/usuarios')
      .then(({ data }) => setUsuarios(data))
      .catch(() => showToast('Erro ao carregar usuários.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const deletar = async (id) => {
    try {
      await api.delete(`/admin/usuarios/${id}`)
      showToast('Usuário excluído.', 'success')
      setConfirmDelete(null)
      carregar()
    } catch { showToast('Erro ao excluir usuário.', 'error') }
  }

  const toggleAdmin = async (u) => {
    try {
      await api.patch(`/admin/usuarios/${u.id}/admin`)
      showToast(u.isAdm ? 'Privilégios removidos.' : 'Usuário promovido a admin!', 'success')
      carregar()
    } catch { showToast('Erro ao alterar privilégios.', 'error') }
  }

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Gestão de Usuários</h2>
      </div>

      {loading ? (
        <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={4} className="admin-table-empty">Nenhum usuário encontrado.</td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${u.isAdm ? 'admin-badge--green' : 'admin-badge--gray'}`}>
                      {u.isAdm ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`admin-btn ${u.isAdm ? 'admin-btn--danger' : 'admin-btn--success'}`}
                        onClick={() => toggleAdmin(u)}
                        title={u.isAdm ? 'Remover admin' : 'Promover a admin'}
                      >
                        <i className={`bi ${u.isAdm ? 'bi-shield-x' : 'bi-shield-check'}`}></i>
                        {u.isAdm ? 'Remover admin' : 'Tornar admin'}
                      </button>
                      <button className="admin-btn admin-btn--danger" onClick={() => setConfirmDelete(u)}>
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

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Excluir Usuário</h3>
              <button className="admin-modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">Excluir o usuário <strong>{confirmDelete.nome}</strong>? Esta ação é irreversível.</p>
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

export default UsuariosAdmin
