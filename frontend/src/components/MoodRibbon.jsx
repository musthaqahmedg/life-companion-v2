import { lastNDays, moodColor, moodInk, prettyDate, MOOD_WORDS } from '../mood'

// One tile per day. Empty days are outlined, logged days take their mood colour.
export default function MoodRibbon({ entries, days = 28, showNumbers = true, onPick, selected }) {
  const byDate = Object.fromEntries(entries.map((e) => [e.date, e]))
  const dates = lastNDays(days)

  return (
    <ol className="ribbon" style={{ '--days': days }} aria-label={`Mood over the last ${days} days`}>
      {dates.map((date) => {
        const e = byDate[date]
        const label = e
          ? `${prettyDate(date)}: mood ${e.mood_score}, ${MOOD_WORDS[e.mood_score]}`
          : `${prettyDate(date)}: no check-in`
        const style = e ? { background: moodColor(e.mood_score), color: moodInk(e.mood_score) } : undefined
        const content = showNumbers && e ? e.mood_score : ''
        return (
          <li key={date} className={`ribbon-day${e ? '' : ' is-empty'}${selected === date ? ' is-selected' : ''}`}>
            {onPick ? (
              <button type="button" style={style} title={label} aria-label={label} onClick={() => onPick(date)}>
                {content}
              </button>
            ) : (
              <span style={style} title={label} aria-label={label}>{content}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
