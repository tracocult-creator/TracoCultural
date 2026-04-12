import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import WelcomePage from './componentes/WelcomePage'
import Home from './paginas/Home'
import Logar from './paginas/Logar'
import Cadastrar from './paginas/Cadastrar'
import Favoritos from './paginas/Favoritos'
import Perfil from './paginas/Perfil'
import Configuracoes from './paginas/Configuracoes'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/logar" replace />
}

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h2>404 — Página não encontrada</h2>
    <a href="/">Voltar ao início</a>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/logar" element={<Logar />} />
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
