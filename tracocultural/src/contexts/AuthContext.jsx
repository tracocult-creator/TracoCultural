import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (userData) => {
    const token = userData.token || userData.accessToken || userData.access_token || userData.jwt
    if (token) {
      localStorage.setItem('token', token)
      const userWithoutToken = { ...userData }
      delete userWithoutToken.token
      delete userWithoutToken.accessToken
      delete userWithoutToken.access_token
      delete userWithoutToken.jwt
      setUser(userWithoutToken)
      localStorage.setItem('user', JSON.stringify(userWithoutToken))
    } else {
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
