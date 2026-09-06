import React, { useEffect, useMemo, useState } from 'react'
import api from '../../servicos/api'
import AdminToolbar from './AdminToolbar'

const normalizar = (str) =>
  (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const ComentariosAdmin = ({ showToast }) => {
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [busca, setBusca] = useState('')
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('recentes')

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

  const comentariosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    let lista = comentarios.filter((c) => {
      const nomeEvento = c.nomeEvento || c.evento?.nome
      if (termo) {
        const alvo = normalizar(`${c.nomeUsuario || c.usuario?.nome || ''} ${nomeEvento || ''} ${c.texto || ''}`)
        if (!alvo.includes(termo)) return false
      }
      if (filtroEvento === 'com' && !nomeEvento) return false
      if (filtroEvento === 'sem' && nomeEvento) return false
      return true
    })

    const dataDe = (c) => new Date(c.dataCriacao || c.criadoEm || 0).getTime()
    lista = [...lista].sort((a, b) => (ordenacao === 'recentes' ? dataDe(b) - dataDe(a) : dataDe(a) - dataDe(b)))

    return lista
  }, [comentarios, busca, filtroEvento, ordenacao])

  const limparFiltros = () => {
    setBusca('')
    setFiltroEvento('todos')
    setOrdenacao('recentes')
  }

  return (
    <>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Gestão de Comentários</h2>
      </div>

      <AdminToolbar
        searchValue={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Pesquisar por usuário, evento ou texto..."
        filters={[
          {
            key: 'evento',
            label: 'Vínculo',
            value: filtroEvento,
            onChange: setFiltroEvento,
            options: [
              { value: 'todos', label: 'Todos' },
              { value: 'com', label: 'Vinculados a evento' },
              { value: 'sem', label: 'Sem evento vinculado' },
            ],
          },
          {
            key: 'ordenacao',
            label: 'Ordenar',
            value: ordenacao,
            onChange: setOrdenacao,
            options: [
              { value: 'recentes', label: 'Mais recentes' },
              { value: 'antigos', label: 'Mais antigos' },
            ],
          },
        ]}
        total={comentarios.length}
        filteredTotal={comentariosFiltrados.length}
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
                <th>Evento</th>
                <th>Comentário</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-empty">Nenhum comentário encontrado.</td></tr>
              ) : comentariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <i className="bi bi-search" style={{ display: 'block', fontSize: '1.4rem', marginBottom: '.4rem' }}></i>
                    Nenhum comentário corresponde à pesquisa/filtros.
                  </td>
                </tr>
              ) : comentariosFiltrados.map((c) => (
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