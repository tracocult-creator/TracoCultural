import React, { useState } from 'react'
import { atualizarEvento } from '../servicos/api'

/**
 * Modal de edição de evento, reutilizável em qualquer tela que liste
 * eventos do próprio usuário (Home, Perfil, página de detalhe).
 */
const EditarEventoModal = ({ evento, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    nome: evento.nome || '',
    descricao: evento.descricao || '',
    dataInicio: evento.dataInicio ? evento.dataInicio.slice(0, 16) : '',
    dataFim: evento.dataFim ? evento.dataFim.slice(0, 16) : '',
    cidade: evento.cidade || '',
    linkExterno: evento.linkExterno || '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSalvar = async () => {
    if (!form.nome.trim() || !form.dataInicio || !form.cidade.trim()) {
      setErro('Nome, data de início e cidade são obrigatórios.')
      return
    }
    setErro('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
      }
      const { data } = await atualizarEvento(evento.id, payload)
      onSalvo(data)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao editar evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-evento-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Editar Evento</h3>

        {erro && (
          <p className="profile-alert profile-alert--error" style={{ margin: '0.75rem 1.5rem 0' }}>
            {erro}
          </p>
        )}

        <label>Nome *</label>
        <input
          className="form-input"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          maxLength={100}
        />

        <label>Descrição</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          maxLength={255}
        />

        <div className="edit-row">
          <div>
            <label>Data de Início *</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.dataInicio}
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
            />
          </div>
          <div>
            <label>Data de Término</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.dataFim}
              onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
            />
          </div>
        </div>

        <label>Cidade *</label>
        <input
          className="form-input"
          value={form.cidade}
          onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          maxLength={45}
        />

        <label>Link Externo</label>
        <input
          className="form-input"
          type="url"
          value={form.linkExterno}
          onChange={(e) => setForm({ ...form, linkExterno: e.target.value })}
          placeholder="https://…"
        />

        <div className="modal-actions">
          <button onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar'}
          </button>
          <button onClick={onClose} disabled={loading}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default EditarEventoModal
