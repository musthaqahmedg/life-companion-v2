import { useEffect, useState } from 'react'
import { api, setSessionExpiredHandler } from './api'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'

function App() {
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn())

  useEffect(() => {
    setSessionExpiredHandler(() => setLoggedIn(false))
  }, [])

  function logout() {
    api.logout()
    setLoggedIn(false)
  }

  return loggedIn
    ? <Dashboard onLogout={logout} />
    : <AuthScreen onAuthed={() => setLoggedIn(true)} />
}

export default App
