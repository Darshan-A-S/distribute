import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const u = await api.login({ username, password })
    setUser(u)
    return u
  }

  const register = async (username, password) => {
    const u = await api.register({ username, password })
    setUser(u)
    return u
  }

  const logout = async () => {
    try { await api.logout() } catch (e) {}
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)