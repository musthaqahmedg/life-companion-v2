import { useState } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'

function App() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <main style={{ padding: '32px 16px', textAlign: 'center' }}>
      <h1>Life Companion</h1>
      {showLogin ? (
        <Login onSwitchToSignup={() => setShowLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </main>
  )
}

export default App
