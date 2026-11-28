import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { localISODate } from '../mood'
import CheckInForm from './CheckInForm'
import History from './History'
import InsightPanel from './InsightPanel'
import MoodRibbon from './MoodRibbon'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard({ onLogout }) {
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState({ count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState(localISODate())

  const name = (api.email() || '').split('@')[0]

  const load = useCallback(async () => {
    try {
      const data = await api.entries()
      setError('')
      setEntries(data.entries)
      setStats(data.stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function save(entry) {
    await api.saveEntry(entry)
    await load()
  }

  async function remove(d) {
    await api.deleteEntry(d)
    await load()
  }

  function edit(d) {
    setDate(d)
    document.getElementById('checkin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const existing = entries.find((e) => e.date === date)

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand">Life Companion</p>
        <button type="button" className="link" onClick={onLogout}>Log out</button>
      </header>

      <main className="dash">
        <h1 className="hello">{greeting()}{name ? `, ${name}` : ''}.</h1>

        {error && <p className="error" role="alert">{error} <button className="link" onClick={load}>Try again</button></p>}

        <div className="dash-top">
          <section id="checkin" aria-label="Daily check-in">
            {loading
              ? <div className="checkin"><p className="muted">Loading your check-ins…</p></div>
              : <CheckInForm key={date} date={date} setDate={setDate} existing={existing} onSave={save} />}
          </section>
          <InsightPanel entryCount={stats.count || 0} />
        </div>

        <section className="trend" aria-labelledby="trend-title">
          <div className="section-head">
            <h2 id="trend-title">Last four weeks</h2>
            <p className="muted">Tap a day to open it.</p>
          </div>
          {loading ? <p className="muted">Loading…</p> : <MoodRibbon entries={entries} onPick={edit} selected={date} />}

          {stats.count > 0 && (
            <dl className="figures">
              <div><dt>Average mood</dt><dd>{stats.avg_mood}<small>/10</small></dd></div>
              <div><dt>Average sleep</dt><dd>{stats.avg_sleep}<small> h</small></dd></div>
              <div><dt>Exercise logged</dt><dd>{stats.total_exercise}<small> min</small></dd></div>
              <div><dt>Check-ins</dt><dd>{stats.count}</dd></div>
            </dl>
          )}
        </section>

        <section className="past" aria-labelledby="past-title">
          <h2 id="past-title">Past check-ins</h2>
          {!loading && <History entries={entries} onEdit={edit} onDelete={remove} />}
        </section>
      </main>
    </div>
  )
}
