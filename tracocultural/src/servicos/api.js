import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// navigate é injetado pelo hook useAxiosInterceptor (ver App.jsx)
export const setupInterceptor401 = (navigate) => {
  const id = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/logar', { replace: true })
      }
      return Promise.reject(error)
    }
  )
  return () => api.interceptors.response.eject(id)
}

export const loginUsuario = (email, senha) =>
  api.post('/auth/login', { email, senha })  // ← era /usuarios/auth/login

export const cadastrarUsuario = (dados) =>
  api.post('/auth/register', dados)

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

export const getComentarios = (eventoId) =>
  api.get(`/eventos/${eventoId}/comentarios`)

export const criarComentario = (eventoId, texto) =>
  api.post(`/eventos/${eventoId}/comentarios`, { texto })

export const deletarComentario = (eventoId, comentarioId) =>
  api.delete(`/eventos/${eventoId}/comentarios/${comentarioId}`)

export default api