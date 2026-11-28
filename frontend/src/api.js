// Talks to the FastAPI backend. Stores tokens in localStorage and
// refreshes the access token automatically when it expires.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const store = {
  get access() { return localStorage.getItem('access_token') },
  get refresh() { return localStorage.getItem('refresh_token') },
  get email() { return localStorage.getItem('email') },
  save({ access_token, refresh_token, email }) {
    if (access_token) localStorage.setItem('access_token', access_token)
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
    if (email) localStorage.setItem('email', email)
  },
  clear() {
    ;['access_token', 'refresh_token', 'email'].forEach((k) => localStorage.removeItem(k))
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function errorMessage(data, status) {
  const d = data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d[0]?.msg) {
    const field = d[0].loc?.at(-1)
    return field ? `${field.replaceAll('_', ' ')}: ${d[0].msg}` : d[0].msg
  }
  if (status >= 500) return 'The server had a problem. Try again in a moment.'
  return 'Something went wrong. Try again.'
}

async function raw(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status)
  return data
}

let onSessionExpired = () => {}
export function setSessionExpiredHandler(fn) { onSessionExpired = fn }

// Authenticated request: on 401, try one token refresh, then retry once.
async function authed(path, options = {}) {
  try {
    return await raw(path, { ...options, token: store.access })
  } catch (err) {
    if (err.status !== 401 || !store.refresh) throw err
    try {
      const { access_token } = await raw('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: store.refresh },
      })
      store.save({ access_token })
    } catch {
      store.clear()
      onSessionExpired()
      throw new ApiError('Your session ended. Log in again.', 401)
    }
    return raw(path, { ...options, token: store.access })
  }
}

export const api = {
  isLoggedIn: () => Boolean(store.access && store.refresh),
  email: () => store.email,

  async login(email, password) {
    store.save(await raw('/api/auth/login', { method: 'POST', body: { email, password } }))
  },
  async signup(email, password) {
    store.save(await raw('/api/auth/signup', { method: 'POST', body: { email, password } }))
  },
  logout() { store.clear() },

  entries: () => authed('/api/entries?limit=90'),
  saveEntry: (entry) => authed('/api/entries', { method: 'POST', body: entry }),
  deleteEntry: (date) => authed(`/api/entries/${date}`, { method: 'DELETE' }),
  insight: () => authed('/api/insights', { method: 'POST' }),
}
