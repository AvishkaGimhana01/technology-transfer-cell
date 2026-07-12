import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, fetchMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ttc_token')
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('ttc_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { access_token } = await apiLogin(email, password)
    localStorage.setItem('ttc_token', access_token)
    const me = await fetchMe()
    setUser(me)
    return me
  }

  function logout() {
    localStorage.removeItem('ttc_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
