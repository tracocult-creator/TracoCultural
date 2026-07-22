import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/logar'
    }
    return Promise.reject(error)
  }
)

// AUTH
export const loginUsuario = (email, senha) =>
  api.post('/auth/login', { email, senha })

export const cadastrarUsuario = (dados) =>
  api.post('/auth/register', dados)

export const verificarCodigo = (email, codigo) =>
  api.post('/auth/verificar-codigo', { email, codigo })

export const reenviarCodigo = (email) =>
  api.post('/auth/reenviar-codigo', { email })

export const esqueciSenha = (email) =>
  api.post('/auth/esqueci-senha', { email })

export const redefinirSenha = (email, codigo, novaSenha) =>
  api.post('/auth/redefinir-senha', { email, codigo, novaSenha })

// USUARIOS
export const getUsuario = (id) => api.get(`/usuarios/${id}`)
export const atualizarUsuario = (id, dados) => api.put(`/usuarios/${id}`, dados)
export const deletarUsuario = (id) => api.delete(`/usuarios/${id}`)

// EVENTOS
export const getEventos = (params) => api.get('/eventos', { params })
export const getEventoPorId = (id) => api.get(`/eventos/${id}`)
export const criarEvento = (payload) => api.post('/eventos', payload)
export const getEventosDoUsuario = (idUsuario) => api.get('/eventos', { params: { idUsuario } })

// COMENTÁRIOS
export const getComentarios = (eventoId) =>
  api.get(`/eventos/${eventoId}/comentarios`)
export const criarComentario = (eventoId, texto) =>
  api.post(`/eventos/${eventoId}/comentarios`, { texto })
export const deletarComentario = (eventoId, comentarioId) =>
  api.delete(`/eventos/${eventoId}/comentarios/${comentarioId}`)

// FAVORITOS
export const getFavoritos = () => api.get('/favoritos')
export const adicionarFavorito = (eventoId) => api.post('/favoritos', { idEventoFk: eventoId })
export const removerFavorito = (eventoId) => api.delete(`/favoritos/${eventoId}`)

export default api