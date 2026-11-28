import { useState } from 'react'
import { moodColor, moodInk, prettyDate, MOOD_WORDS } from '../mood'

export default function History({ entries, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(null)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)
  const PAGE = 10

  if (entries.length === 0) {
    return <p className="muted empty">Your past check-ins will be listed here.</p>
  }

  async function remove(date) {
    setError('')
    try {
      await onDelete(date)
      setConfirming(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="history">
        {(showAll ? entries : entries.slice(0, PAGE)).map((e) => (
          <li key={e.date}>
            <span className="history-mood" style={{ background: moodColor(e.mood_score), color: moodInk(e.mood_score) }} aria-label={`Mood ${e.mood_score}, ${MOOD_WORDS[e.mood_score]}`}>
              {e.mood_score}
            </span>
            <div className="history-main">
              <p className="history-date">{prettyDate(e.date, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <p className="history-meta">
                {e.sleep_hours} h sleep, {e.exercise_minutes ?? 0} min exercise
              </p>
              {e.notes && <p className="history-notes">{e.notes}</p>}
            </div>
            <div className="history-actions">
              {confirming === e.date ? (
                <>
                  <span className="muted">Delete?</span>
                  <button type="button" className="link danger" onClick={() => remove(e.date)}>Delete</button>
                  <button type="button" className="link" onClick={() => setConfirming(null)}>Keep</button>
                </>
              ) : (
                <>
                  <button type="button" className="link" onClick={() => onEdit(e.date)}>Edit</button>
                  <button type="button" className="link" onClick={() => setConfirming(e.date)}>Delete</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {entries.length > PAGE && (
        <button type="button" className="link more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : `Show ${entries.length - PAGE} older check-ins`}
        </button>
      )}
    </>
  )
}
