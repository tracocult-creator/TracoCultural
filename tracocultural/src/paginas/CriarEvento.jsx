import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../componentes/Navbar'
import api from '../servicos/services/api'
import '../estilos/CriarEvento.css'

const categorias = [
  { id: 1, nome: 'Social' },
  { id: 2, nome: 'Música' },
  { id: 3, nome: 'Cultura & Arte' },
  { id: 4, nome: 'Profissional' },
  { id: 5, nome: 'Educação' },
  { id: 6, nome: 'Tecnologia' },
  { id: 7, nome: 'Bem-Estar' },
  { id: 8, nome: 'Esporte' },
  { id: 9, nome: 'Gastronomia' },
  { id: 10, nome: 'Comércio' },
  { id: 11, nome: 'Kids' },
  { id: 12, nome: 'Religioso' },
  { id: 13, nome: 'Comunidade' },
  { id: 14, nome: 'Geek' },
  { id: 15, nome: 'Viagem' },
]

const CriarEvento = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    cidade: '',
    idCategoriaFk: '',
    linkexterno: '',
    cardImage: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm((prev) => ({ ...prev, cardImage: file }))
    setPreviewImage(URL.createObjectURL(file))
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (!form.nome || !form.dataInicio || !form.cidade || !form.idCategoriaFk) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
        cidade: form.cidade,
        idCategoriaFk: Number(form.idCategoriaFk),
        cardImage: form.cardImage ? await toBase64(form.cardImage) : null,
        idUsuarioFk: user?.id,
      }

      await api.post('/eventos', payload)
      navigate('/home')
    } catch (err) {
      setErro('Erro ao criar evento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="criar-evento-page">
      <Navbar onLogout={onLogout} />

      <div className="criar-evento-layout">
        {/* Painel esquerdo — preview */}
        <div className="criar-evento-preview">
          <div className="preview-banner">
            {previewImage ? (
              <img src={previewImage} alt="Banner do evento" className="preview-img" />
            ) : (
              <div className="preview-placeholder">
                <i className="bi bi-image"></i>
                <span>Prévia do banner</span>
              </div>
            )}
          </div>
          <div className="preview-info">
            <h2>{form.nome || 'Nome do Evento'}</h2>
            <p className="preview-meta">
              {form.dataInicio ? `📅 ${form.dataInicio}` : '📅 Data de início'}
              {form.dataFim ? ` → ${form.dataFim}` : ''}
            </p>
            <p className="preview-meta">📍 {form.cidade || 'Cidade'}</p>
            {form.idCategoriaFk && (
              <span className="preview-categoria">
                {categorias.find((c) => c.id === Number(form.idCategoriaFk))?.nome}
              </span>
            )}
          </div>
        </div>

        {/* Formulário direito */}
        <div className="criar-evento-form-wrapper">
          <h1 className="criar-evento-titulo">Criar Evento</h1>

          <form className="criar-evento-form" onSubmit={handleSubmit}>
            {/* Banner */}
            <div className="form-section">
              <label className="form-label">Imagem / Banner do Evento</label>
              <div
                className="upload-area"
                onClick={() => document.getElementById('inputBanner').click()}
              >
                {previewImage ? (
                  <img src={previewImage} alt="banner" className="upload-preview" />
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up upload-icon"></i>
                    <p>Clique para enviar uma imagem</p>
                    <span>PNG, JPG ou JPEG</span>
                  </>
                )}
              </div>
              <input
                id="inputBanner"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImage}
              />
            </div>

            {/* Nome */}
            <div className="form-section">
              <label className="form-label">Nome do Evento *</label>
              <input
                className="form-input"
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Festival de Música 2025"
                maxLength={100}
                required
              />
            </div>

            {/* Descrição */}
            <div className="form-section">
              <label className="form-label">Descrição</label>
              <p className="form-hint">Inclua data, horário, local e demais informações relevantes.</p>
              <textarea
                className="form-textarea"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descreva o evento, programação, horários, endereço completo..."
                rows={6}
                maxLength={255}
              />
            </div>

            {/* Datas */}
            <div className="form-row">
              <div className="form-section">
                <label className="form-label">Data de Início *</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  name="dataInicio"
                  value={form.dataInicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-section">
                <label className="form-label">Data de Término</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  name="dataFim"
                  value={form.dataFim}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Cidade */}
            <div className="form-section">
              <label className="form-label">Cidade *</label>
              <input
                className="form-input"
                type="text"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                maxLength={45}
                required
              />
            </div>

            {/* Categoria */}
            <div className="form-section">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                name="idCategoriaFk"
                value={form.idCategoriaFk}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Link externo */}
            <div className="form-section">
              <label className="form-label">Link Oficial do Evento <span className="opcional">(opcional)</span></label>
              <input
                className="form-input"
                type="url"
                name="linkexterno"
                value={form.linkexterno}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            {erro && <p className="form-erro">{erro}</p>}

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => navigate('/home')}>
                Cancelar
              </button>
              <button type="submit" className="btn-publicar" disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CriarEvento
