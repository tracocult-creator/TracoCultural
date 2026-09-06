import React, { useEffect, useMemo, useState } from 'react'
import api from '../../servicos/api'
import AdminToolbar from './AdminToolbar'

const normalizar = (str) =>
  (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?'

const UsuariosAdmin = ({ showToast }) => {
  const [usuarios, setUsuarios] = useState([])
  const [idsComEvento, setIdsComEvento] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroEvento, setFiltroEvento] = useState('todos')

  const carregar = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/usuarios'),
      api.get('/admin/eventos').catch(() => ({ data: [] })),
    ])
      .then(([resUsuarios, resEventos]) => {
        setUsuarios(resUsuarios.data)
        const ids = new Set(
          (resEventos.data || [])
            .map((ev) => ev.usuario?.id ?? ev.idUsuarioFk)
            .filter((id) => id !== undefined && id !== null)
        )
        setIdsComEvento(ids)
      })
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

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    return usuarios.filter((u) => {
      if (termo) {
        const alvo = normalizar(`${u.nome} ${u.email}`)
        if (!alvo.includes(termo)) return false
      }
      if (filtroTipo === 'admin' && !u.isAdm) return false
      if (filtroTipo === 'comum' && u.isAdm) return false

      const temEvento = idsComEvento.has(u.id)
      if (filtroEvento === 'com' && !temEvento) return false
      if (filtroEvento === 'sem' && temEvento) return false

      return true
    })
  }, [usuarios, busca, filtroTipo, filtroEvento, idsComEvento])

  const limparFiltros = () => {
    setBusca('')
    setFiltroTipo('todos')
    setFiltroEvento('todos')
  }

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Gestão de Usuários</h2>
      </div>

      <AdminToolbar
        searchValue={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Pesquisar por nome ou e-mail..."
        filters={[
          {
            key: 'tipo',
            label: 'Perfil',
            value: filtroTipo,
            onChange: setFiltroTipo,
            options: [
              { value: 'todos', label: 'Todos os perfis' },
              { value: 'admin', label: 'Somente admins' },
              { value: 'comum', label: 'Somente usuários' },
            ],
          },
          {
            key: 'evento',
            label: 'Eventos',
            value: filtroEvento,
            onChange: setFiltroEvento,
            options: [
              { value: 'todos', label: 'Com ou sem evento' },
              { value: 'com', label: 'Com evento criado' },
              { value: 'sem', label: 'Sem evento criado' },
            ],
          },
        ]}
        total={usuarios.length}
        filteredTotal={usuariosFiltrados.length}
        onClearFilters={limparFiltros}
      />

      {loading ? (
        <div className="admin-loading"><i className="bi bi-arrow-repeat"></i> Carregando...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Eventos</th>
                <th>Admin</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-empty">Nenhum usuário encontrado.</td></tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <i className="bi bi-search" style={{ display: 'block', fontSize: '1.4rem', marginBottom: '.4rem' }}></i>
                    Nenhum usuário corresponde à pesquisa/filtros.
                  </td>
                </tr>
              ) : usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-avatar" style={{ background: u.corFundo || 'rgba(212,163,115,.25)' }}>
                        {iniciais(u.nome)}
                      </span>
                      {u.nome}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${idsComEvento.has(u.id) ? 'admin-badge--green' : 'admin-badge--gray'}`}>
                      {idsComEvento.has(u.id) ? 'Com evento' : 'Sem evento'}
                    </span>
                  </td>
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