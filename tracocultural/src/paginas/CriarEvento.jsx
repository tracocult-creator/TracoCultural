import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../componentes/Navbar'
import api from '../servicos/api'
import '../estilos/CriarEvento.css'

const CATEGORIAS = [
  { id: 1,  nome: 'Social' },
  { id: 2,  nome: 'Musica' },
  { id: 3,  nome: 'Cultura & Arte' },
  { id: 4,  nome: 'Profissional' },
  { id: 5,  nome: 'Educacao' },
  { id: 6,  nome: 'Tecnologia' },
  { id: 7,  nome: 'Bem-Estar' },
  { id: 8,  nome: 'Esporte' },
  { id: 9,  nome: 'Gastronomia' },
  { id: 10, nome: 'Comercio' },
  { id: 11, nome: 'Kids' },
  { id: 12, nome: 'Religioso' },
  { id: 13, nome: 'Comunidade' },
  { id: 14, nome: 'Geek' },
  { id: 15, nome: 'Viagem' },
]

const CriarEvento = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    cidade: '',
    linkExterno: '',
    categoriaId: '',
  })
  const [imagem, setImagem] = useState(null)
  const [imagemPreview, setImagemPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagem(file)
    setImagemPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImagem(file)
    setImagemPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (!form.nome || !form.dataInicio || !form.cidade || !form.categoriaId) {
      setErro('Preencha todos os campos obrigatorios.')
      return
    }

    setLoading(true)
    try {
      // Converte imagem para base64 se existir
      let cardImageBase64 = null
      if (imagem) {
        cardImageBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          // Jackson maps a raw Base64 JSON string to byte[]; keep the data URL prefix out.
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(imagem)
        })
      }

      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
        cidade: form.cidade,
        linkExterno: form.linkExterno || null,
        usuario: { id: user.id },
        categoria: { id: Number(form.categoriaId) },
        cardImage: cardImageBase64,
      }

      await api.post('/eventos', payload)
      navigate('/home')
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar evento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="criar-evento-page">
      <Navbar />

      <div className="criar-evento-layout">

        {/* Preview */}
        <div className="criar-evento-preview">
          <div className="preview-card">
            <div
              className="preview-banner"
              style={{ backgroundImage: imagemPreview ? `url(${imagemPreview})` : 'none' }}
            >
              {!imagemPreview && (
                <div className="preview-banner-placeholder">
                  <i className="bi bi-image"></i>
                  <span>Preview do banner</span>
                </div>
              )}
              {form.categoriaId && (
                <span className="preview-categoria-badge">
                  {CATEGORIAS.find(c => c.id === Number(form.categoriaId))?.nome}
                </span>
              )}
            </div>
            <div className="preview-body">
              <h3 className="preview-nome">{form.nome || 'Nome do evento'}</h3>
              {form.dataInicio && (
                <p className="preview-info">
                  <i className="bi bi-calendar3"></i>{' '}
                  {new Date(form.dataInicio).toLocaleDateString('pt-BR')}
                  {form.dataFim && ` -> ${new Date(form.dataFim).toLocaleDateString('pt-BR')}`}
                </p>
              )}
              {form.cidade && (
                <p className="preview-info">
                  <i className="bi bi-geo-alt"></i> {form.cidade}
                </p>
              )}
              {form.descricao && (
                <p className="preview-descricao">
                  {form.descricao.slice(0, 120)}{form.descricao.length > 120 ? '...' : ''}
                </p>
              )}
            </div>
          </div>
          <p className="preview-label">Pre-visualizacao do card</p>
        </div>

        {/* Formulario */}
        <div className="criar-evento-form-wrapper">
          <div className="criar-evento-header">
            <h1>Criar Evento</h1>
            <p>Compartilhe sua experiencia cultural com a comunidade</p>
          </div>

          {erro && <div className="criar-evento-erro">{erro}</div>}

          <form className="criar-evento-form" onSubmit={handleSubmit}>

            <div className="form-section">
              <label className="form-label">Banner do Evento</label>
              <div
                className={`upload-area ${imagemPreview ? 'upload-area--filled' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('inputImagem').click()}
              >
                {imagemPreview ? (
                  <>
                    <img src={imagemPreview} alt="Preview" className="upload-preview" />
                    <button
                      type="button"
                      className="upload-remove"
                      onClick={(e) => { e.stopPropagation(); setImagem(null); setImagemPreview(null) }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <i className="bi bi-cloud-arrow-up"></i>
                    <span>Arraste uma imagem ou <strong>clique para selecionar</strong></span>
                    <small>JPG, PNG ou WEBP - Recomendado 1200x600px</small>
                  </div>
                )}
                <input
                  id="inputImagem"
                  type="file"
                  accept="image/*"
                  onChange={handleImagem}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Nome do Evento <span className="obrigatorio">*</span></label>
              <input
                className="form-input"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Festival de Jazz de Sao Paulo"
                maxLength={100}
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label">Descricao</label>
              <textarea
                className="form-textarea"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descreva o evento: programacao, atracoes, informacoes de acesso, etc."
                rows={5}
                maxLength={255}
              />
              <small className="form-hint">{form.descricao.length}/255 caracteres</small>
            </div>

            <div className="form-section">
              <label className="form-label">Categoria <span className="obrigatorio">*</span></label>
              <div className="categoria-grid">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`categoria-chip ${Number(form.categoriaId) === cat.id ? 'categoria-chip--ativo' : ''}`}
                    onClick={() => setForm({ ...form, categoriaId: cat.id })}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Data e Horario <span className="obrigatorio">*</span></label>
              <div className="form-row">
                <div className="form-col">
                  <label className="form-sublabel">Inicio</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    name="dataInicio"
                    value={form.dataInicio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-col">
                  <label className="form-sublabel">Termino (opcional)</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    name="dataFim"
                    value={form.dataFim}
                    onChange={handleChange}
                    min={form.dataInicio}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Cidade / Local <span className="obrigatorio">*</span></label>
              <input
                className="form-input"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                placeholder="Ex: Sao Paulo, SP"
                maxLength={45}
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label">Link Oficial do Evento <span className="form-optional">(opcional)</span></label>
              <input
                className="form-input"
                type="url"
                name="linkExterno"
                value={form.linkExterno}
                onChange={handleChange}
                placeholder="https://tracocultural.com.br/seu-evento"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-publicar" disabled={loading}>
                {loading
                  ? <><i className="bi bi-arrow-repeat spin"></i> Publicando...</>
                  : <><i className="bi bi-send"></i> Publicar Evento</>
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default CriarEvento
