import { useState } from 'react'

// Backend address. Set VITE_API_URL in Vercel (or in frontend/.env for local dev).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Login({ onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token ?? '')
        alert('Login successful!')
      } else {
        setError(data.error || data.detail || data.message || 'Login failed.')
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '360px',
        margin: '0 auto',
      }}
    >
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

      <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
        Login
      </button>
      <button
        type="button"
        onClick={onSwitchToSignup}
        style={{ padding: '10px', cursor: 'pointer' }}
      >
        Sign up
      </button>
    </form>
  )
}

export default Login
