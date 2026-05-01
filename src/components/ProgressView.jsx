// Lap Coffee brand blue
const LAP_BLUE = '#1B4FD8'

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatShortMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  const m = date.toLocaleDateString('en-US', { month: 'short' })
  return `${m} '${year.slice(2)}`
}

function getChartData(sessions, exerciseId) {
  // sessions already filtered to this workout, sorted oldest→newest
  const byMonth = {}
  sessions.forEach(session => {
    const month = session.date.substring(0, 7)
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex || !ex.sets.length) return
    const maxW = Math.max(...ex.sets.map(s => s.weight))
    if (byMonth[month] === undefined || maxW > byMonth[month]) {
      byMonth[month] = maxW
    }
  })
  return Object.entries(byMonth).map(([month, value]) => ({
    label: formatShortMonth(month),
    value
  }))
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────

function BarChart({ data, isDark }) {
  if (!data || data.length === 0) return null

  const BAR_W = 36
  const GAP = 12
  const CHART_H = 100
  const TOP_PAD = 24
  const BOT_PAD = 28
  const SVG_H = TOP_PAD + CHART_H + BOT_PAD
  const SVG_W = Math.max(data.length * (BAR_W + GAP) - GAP, 200)
  const maxVal = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="overflow-x-auto">
      <svg
        width={SVG_W}
        height={SVG_H}
        style={{ display: 'block', minWidth: '100%' }}
      >
        {/* Baseline */}
        <line
          x1={0} y1={TOP_PAD + CHART_H}
          x2={SVG_W} y2={TOP_PAD + CHART_H}
          stroke={isDark ? '#262626' : '#e5e7eb'}
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const bh = Math.max(Math.round((d.value / maxVal) * CHART_H), 2)
          const x = i * (BAR_W + GAP)
          const y = TOP_PAD + CHART_H - bh

          return (
            <g key={i}>
              {/* Bar */}
              <rect x={x} y={y} width={BAR_W} height={bh} fill={LAP_BLUE} rx={4} ry={4} />

              {/* Weight label above bar */}
              <text
                x={x + BAR_W / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={10}
                fill={isDark ? '#9ca3af' : '#6b7280'}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {d.value}
              </text>

              {/* Month label below */}
              <text
                x={x + BAR_W / 2}
                y={TOP_PAD + CHART_H + 18}
                textAnchor="middle"
                fontSize={9}
                fill={isDark ? '#525252' : '#9ca3af'}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── XML Export ─────────────────────────────────────────────────────────────────

function escapeXML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function generateXML(sessions, workouts) {
  const today = new Date().toISOString().split('T')[0]

  const workoutsXML = workouts.map(w =>
    `\n    <workout id="${w.id}" name="${escapeXML(w.name)}">\n` +
    w.exercises.map(ex =>
      `      <exercise id="${ex.id}" name="${escapeXML(ex.name)}">\n` +
      ex.sets.map((s, i) =>
        `        <set number="${i + 1}" weight="${s.weight}" reps="${s.reps}"/>`
      ).join('\n') +
      `\n      </exercise>`
    ).join('\n') +
    `\n    </workout>`
  ).join('')

  const sessionsXML = sessions.map(s =>
    `\n    <session id="${s.id}" date="${s.date}" workoutId="${s.workoutId}" workoutName="${escapeXML(s.workoutName)}">\n` +
    s.exercises.map(ex =>
      `      <exercise exerciseId="${ex.exerciseId}" name="${escapeXML(ex.name)}">\n` +
      ex.sets.map((set, i) =>
        `        <set number="${i + 1}" weight="${set.weight}" reps="${set.reps}"/>`
      ).join('\n') +
      `\n      </exercise>`
    ).join('\n') +
    `\n    </session>`
  ).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<training-data exported="${today}">
  <workouts>${workoutsXML}
  </workouts>
  <sessions>${sessionsXML}
  </sessions>
</training-data>`
}

function downloadXML(sessions, workouts) {
  const xml = generateXML(sessions, workouts)
  triggerDownload(xml, `gym-data-${today()}.xml`, 'application/xml;charset=utf-8')
}

// ── CSV Export ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0]
}

// RFC 4180 escaping: wrap in quotes if value contains comma, quote, newline, or CR.
// Inner quotes get doubled.
function escapeCSV(value) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function rowsToCSV(rows) {
  // \r\n line ending so Excel on Windows is happy.
  return rows.map(r => r.map(escapeCSV).join(',')).join('\r\n')
}

function triggerDownload(text, filename, mime) {
  // Prepend UTF-8 BOM so Excel renders umlauts / non-ASCII correctly.
  const blob = new Blob(['﻿', text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateSessionsCSV(sessions) {
  const header = ['date', 'workout', 'exercise', 'set', 'weight_kg', 'reps']
  const rows = [header]
  // Sort by date ascending so the file reads chronologically.
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  for (const s of sorted) {
    for (const ex of s.exercises) {
      ex.sets.forEach((set, i) => {
        rows.push([s.date, s.workoutName, ex.name, i + 1, set.weight, set.reps])
      })
    }
  }
  return rowsToCSV(rows)
}

function generateProgressCSV(workouts, sessions) {
  const header = ['workout', 'exercise', 'month', 'max_weight_kg']
  const rows = [header]
  for (const w of workouts) {
    const wSessions = sessions.filter(s => s.workoutId === w.id)
    for (const ex of w.exercises) {
      const byMonth = {}
      wSessions.forEach(session => {
        const month = session.date.substring(0, 7)
        const sEx = session.exercises.find(e => e.exerciseId === ex.id)
        if (!sEx || !sEx.sets.length) return
        const maxW = Math.max(...sEx.sets.map(s => s.weight))
        if (byMonth[month] === undefined || maxW > byMonth[month]) byMonth[month] = maxW
      })
      Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, max]) => {
          rows.push([w.name, ex.name, month, max])
        })
    }
  }
  return rowsToCSV(rows)
}

function downloadSessionsCSV(sessions) {
  triggerDownload(generateSessionsCSV(sessions), `gym-sessions-${today()}.csv`, 'text/csv;charset=utf-8')
}

function downloadProgressCSV(workouts, sessions) {
  triggerDownload(generateProgressCSV(workouts, sessions), `gym-progress-${today()}.csv`, 'text/csv;charset=utf-8')
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProgressView({ sessions, workouts, activeWorkoutId, theme, onClose }) {
  const isDark = theme === 'dark'

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId) || null

  // Sessions for active workout, sorted oldest → newest (for left-to-right chart)
  const workoutSessions = sessions
    .filter(s => s.workoutId === activeWorkoutId)
    .sort((a, b) => a.date.localeCompare(b.date))

  const exerciseChartData = activeWorkout?.exercises.map(ex => ({
    exercise: ex,
    data: getChartData(workoutSessions, ex.id)
  })) || []

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <button
          onClick={onClose}
          className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold">Progress</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">

        {/* No workout */}
        {!activeWorkout && (
          <div className="flex items-center justify-center h-40">
            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No workout selected.</p>
          </div>
        )}

        {/* No sessions */}
        {activeWorkout && workoutSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No sessions saved yet.</p>
            <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Finish a workout to see your progress here.
            </p>
          </div>
        )}

        {/* Charts per exercise */}
        {activeWorkout && workoutSessions.length > 0 && (
          <div className="flex flex-col gap-8">
            {exerciseChartData.map(({ exercise, data }) => (
              <div key={exercise.id}>
                <h3 className="text-lg font-bold mb-1">{exercise.name}</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Max weight per month (kg)
                </p>

                {data.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    No data for this exercise yet.
                  </p>
                ) : (
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-neutral-900' : 'bg-white shadow-sm'}`}>
                    <BarChart data={data} isDark={isDark} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Export — always shown at the bottom when data exists */}
        {sessions.length > 0 && (
          <div className={`mt-10 pt-8 border-t ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
            <p className={`text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Export data
            </p>
            <p className={`text-xs mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              CSV files open directly in Excel.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => downloadSessionsCSV(sessions)}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-medium transition-colors ${
                  isDark
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
                }`}
              >
                <DownloadIcon />
                All sessions (CSV)
              </button>
              <button
                onClick={() => downloadProgressCSV(workouts, sessions)}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-medium transition-colors ${
                  isDark
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
                }`}
              >
                <DownloadIcon />
                Progress chart data (CSV)
              </button>
              <button
                onClick={() => downloadXML(sessions, workouts)}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-medium transition-colors ${
                  isDark
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
                }`}
              >
                <DownloadIcon />
                Full backup (XML)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
