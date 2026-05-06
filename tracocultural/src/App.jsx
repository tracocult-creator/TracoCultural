import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

 
import WelcomePage from './componentes/WelcomePage'
import Home from './paginas/Home'
import Logar from './paginas/Logar'
import Cadastrar from './paginas/Cadastrar'
import Favoritos from './paginas/Favoritos'
import Perfil from './paginas/Perfil'
import Configuracoes from './paginas/Configuracoes'
import CriarEvento from './paginas/CriarEvento'

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/logar" element={<Logar onLogin={handleLogin} />} />
          <Route path="/cadastrar" element={<Cadastrar onLogin={handleLogin} />} />
          <Route path="/home" element={<Home user={user} onLogout={handleLogout} />} />
          <Route path="/favoritos" element={<Favoritos user={user} onLogout={handleLogout} />} />
          <Route path="/perfil" element={<Perfil user={user} onLogout={handleLogout} />} />
          <Route path="/configuracoes" element={<Configuracoes user={user} onLogout={handleLogout} />} />
          <Route path="/CriarEvento" element={<CriarEvento onLogout={handleLogout} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App