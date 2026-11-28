import { useState } from 'react'
import { localISODate, moodColor, moodInk, prettyDate, MOOD_WORDS } from '../mood'

const blank = { mood_score: null, sleep_hours: '', exercise_minutes: '', notes: '' }

function fromEntry(e) {
  if (!e) return blank
  return {
    mood_score: e.mood_score,
    sleep_hours: String(e.sleep_hours),
    exercise_minutes: String(e.exercise_minutes ?? 0),
    notes: e.notes ?? '',
  }
}

// The parent gives this component key={date}, so switching days starts a fresh form.

export default function CheckInForm({ date, setDate, existing, onSave }) {
  const [form, setForm] = useState(() => fromEntry(existing))
  const [status, setStatus] = useState({ kind: '', text: '' })
  const [busy, setBusy] = useState(false)
  const today = localISODate()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.mood_score) {
      setStatus({ kind: 'error', text: 'Pick a mood from 1 to 10.' })
      return
    }
    setBusy(true)
    setStatus({ kind: '', text: '' })
    try {
      await onSave({
        date,
        mood_score: form.mood_score,
        sleep_hours: Number(form.sleep_hours || 0),
        exercise_minutes: Number(form.exercise_minutes || 0),
        notes: form.notes.trim(),
      })
      setStatus({ kind: 'ok', text: existing ? 'Check-in updated.' : 'Check-in saved.' })
    } catch (err) {
      setStatus({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const heading = date === today ? 'How was today?' : `How was ${prettyDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}?`

  return (
    <form className="checkin" onSubmit={submit}>
      <div className="checkin-head">
        <h2>{heading}</h2>
        <label className="date-pick">
          <span className="sr-only">Check-in date</span>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
      </div>

      <fieldset className="mood-picker">
        <legend>
          Mood {form.mood_score ? <strong>{form.mood_score}, {MOOD_WORDS[form.mood_score].toLowerCase()}</strong> : <span className="muted">tap a number</span>}
        </legend>
        <div className="mood-scale" role="radiogroup" aria-label="Mood from 1 to 10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const on = form.mood_score === n
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${n}, ${MOOD_WORDS[n]}`}
                className={on ? 'is-on' : ''}
                style={{ '--mood': moodColor(n), '--mood-ink': moodInk(n) }}
                onClick={() => setForm((f) => ({ ...f, mood_score: n }))}
              >
                {n}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="pair">
        <label className="field">
          <span>Sleep (hours)</span>
          <input type="number" inputMode="decimal" min="0" max="24" step="0.5" required value={form.sleep_hours} onChange={set('sleep_hours')} />
        </label>
        <label className="field">
          <span>Exercise (minutes)</span>
          <input type="number" inputMode="numeric" min="0" max="1440" step="5" value={form.exercise_minutes} onChange={set('exercise_minutes')} placeholder="0" />
        </label>
      </div>

      <label className="field">
        <span>Notes <span className="muted">(optional)</span></span>
        <textarea rows="3" maxLength={1000} value={form.notes} onChange={set('notes')} placeholder="What stood out today?" />
      </label>

      <div className="checkin-foot">
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : existing ? 'Update check-in' : 'Save check-in'}
        </button>
        {status.text && (
          <p className={status.kind === 'error' ? 'error' : 'ok'} role={status.kind === 'error' ? 'alert' : 'status'}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  )
}
