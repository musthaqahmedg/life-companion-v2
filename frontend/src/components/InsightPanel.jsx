import { useState } from 'react'
import { api } from '../api'

export default function InsightPanel({ entryCount }) {
  const [insight, setInsight] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setBusy(true)
    setError('')
    try {
      setInsight(await api.insight())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="insight" aria-labelledby="insight-title" aria-busy={busy}>
      <h2 id="insight-title">Your reflection</h2>

      {!insight && !busy && (
        <p className="muted">
          {entryCount >= 3
            ? 'Get a short read on your last two weeks: what is going well and one thing to try.'
            : `Log ${3 - entryCount} more day${3 - entryCount === 1 ? '' : 's'} for a useful reflection. You can still ask now.`}
        </p>
      )}

      {busy && <p className="thinking">Reading your check-ins…</p>}

      {insight && !busy && (
        <div className="insight-body">
          <p className="insight-summary">{insight.summary}</p>
          {insight.highlights?.length > 0 && (
            <ul>
              {insight.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
          )}
          {insight.suggestion && (
            <p className="insight-try"><strong>Try this week:</strong> {insight.suggestion}</p>
          )}
          <p className="fine">
            {insight.source === 'claude' ? 'Written by Claude from your check-ins.' : 'Built-in summary of your check-ins.'} Not medical advice.
          </p>
        </div>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      <button className="secondary" type="button" onClick={load} disabled={busy}>
        {insight ? 'Refresh reflection' : 'Get my reflection'}
      </button>
    </aside>
  )
}
