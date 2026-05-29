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

export const loginUsuario = (email, senha) =>
  api.post('/auth/login', { email, senha })  // ← era /usuarios/auth/login

export const cadastrarUsuario = (dados) =>
  api.post('/usuarios/auth/register', dados)

export const getFavoritos = () =>
  api.get('/favoritos')

export const removerFavorito = (eventoId) =>
  api.delete(`/favoritos/${eventoId}`)

export const adicionarFavorito = (eventoId) =>
  api.post('/favoritos', { idEventoFk: eventoId })  // ← backend espera idEventoFk

export const getEventos = (params) =>
  api.get('/eventos', { params })  // ← adicionado para uso no Home.jsx

export const getEventoPorId = (id) =>
  api.get(`/eventos/${id}`)

export default api