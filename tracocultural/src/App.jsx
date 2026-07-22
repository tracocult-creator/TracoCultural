import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import WelcomePage from './componentes/WelcomePage'
import Home from './paginas/Home'
import Logar from './paginas/Logar'
import Cadastrar from './paginas/Cadastrar'
import VerificarCodigo from './paginas/VerificarCodigo'
import EsqueciSenha from './paginas/EsqueciSenha'
import RedefinirSenha from './paginas/RedefinirSenha'
import Favoritos from './paginas/Favoritos'
import Perfil from './paginas/Perfil'
import Configuracoes from './paginas/Configuracoes'
import CriarEvento from './paginas/CriarEvento'
import EventoDetalhe from './paginas/EventoDetalhe'
import Admin from './paginas/Admin'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/logar" replace />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/logar" replace />
  if (!user.isAdm) return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/logar" element={<Logar />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/verificar-codigo" element={<VerificarCodigo />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/favoritos" element={<PrivateRoute><Favoritos /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
      <Route path="/criar-evento" element={<PrivateRoute><CriarEvento /></PrivateRoute>} />
      <Route path="/eventos/:id" element={<EventoDetalhe />} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App