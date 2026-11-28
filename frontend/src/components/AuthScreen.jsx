import { useState } from 'react'
import { api } from '../api'
import { lastNDays } from '../mood'
import MoodRibbon from './MoodRibbon'

// A made-up month for the welcome screen, so the ribbon shows what it does.
const SAMPLE = [4, 5, 5, 6, 3, 4, 6, 7, 7, 8, 6, 5, 7, 8, 9, 8, 7, 6, 8, 8, 9, 7, 6, 7, 8, 9, 9, 8]
const sampleEntries = lastNDays(28).map((date, i) => ({ date, mood_score: SAMPLE[i] }))

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await api.login(email, password)
      else await api.signup(email, password)
      onAuthed()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  return (
    <main className="auth">
      <section className="auth-story">
        <p className="brand">Life Companion</p>
        <h1>A minute a day. A clearer picture of how you're really doing.</h1>
        <p className="lede">
          Log your mood, sleep and movement each day. Your days add up to patterns,
          and an AI reflection helps you notice what lifts you.
        </p>
        <MoodRibbon entries={sampleEntries} showNumbers={false} />
        <p className="ribbon-caption">Each square is a day, coloured from low mood to high.</p>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={isLogin} className={isLogin ? 'is-active' : ''} onClick={() => switchMode('login')}>
            Log in
          </button>
          <button role="tab" aria-selected={!isLogin} className={!isLogin ? 'is-active' : ''} onClick={() => switchMode('signup')}>
            Create account
          </button>
        </div>

        <h2 id="auth-title">{isLogin ? 'Welcome back' : 'Start your journal'}</h2>

        <form onSubmit={submit} className="stack">
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <small>At least 8 characters.</small>}
          </label>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="primary" type="submit" disabled={busy}>
            {busy ? (isLogin ? 'Logging in…' : 'Creating account…') : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  )
}
