import { useState, useRef } from 'react'

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function initActualData(workout) {
  if (!workout) return {}
  const data = {}
  workout.exercises.forEach(ex => {
    data[ex.id] = { sets: ex.sets.map(() => ({ weight: '', reps: '' })) }
  })
  return data
}

// ── Confirmation Dialog ────────────────────────────────────────────────────────

function ConfirmDialog({ isDark, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div className={`relative w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
        <h3 className="text-xl font-bold mb-2 text-center">All done?</h3>
        <p className={`text-sm text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your workout will be saved and next session's targets updated.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-colors ${
              isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-colors ${
              isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            Yes, save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function WorkoutView({ workout, theme, onSettingsClick, onProgressClick, onSubmitSession }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [actualData, setActualData] = useState(() => initActualData(workout))
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const isDark = theme === 'dark'
  const exercises = workout?.exercises || []
  const exercise = exercises[currentIndex] || null

  const goNext = () => { if (currentIndex < exercises.length - 1) setCurrentIndex(i => i + 1) }
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1) }

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx > 0) goNext(); else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const updateActual = (exId, setIdx, field, value) => {
    setActualData(d => ({
      ...d,
      [exId]: {
        sets: d[exId].sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s)
      }
    }))
  }

  const doSubmit = () => {
    const session = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString().split('T')[0],
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: (actualData[ex.id]?.sets || []).map((s, i) => ({
          weight: s.weight !== '' ? parseFloat(s.weight) || 0 : (ex.sets[i]?.weight || 0),
          reps: s.reps !== '' ? parseInt(s.reps) || 0 : (ex.sets[i]?.reps || 0),
        }))
      }))
    }
    onSubmitSession(session)
    setShowConfirm(false)
    setSubmitted(true)
  }

  const handleStartNew = () => {
    setActualData(initActualData(workout))
    setSubmitted(false)
    setCurrentIndex(0)
  }

  // ── Submitted screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="text-5xl mb-2">✓</div>
        <h2 className="text-2xl font-bold">Workout saved!</h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your targets have been updated for next time.
        </p>
        <button
          onClick={handleStartNew}
          className={`mt-4 px-8 py-3 rounded-2xl font-semibold transition-colors ${
            isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          Start new session
        </button>
      </div>
    )
  }

  // ── Main screen ───────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="h-screen flex flex-col select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button
            onClick={onProgressClick}
            className={`transition-colors p-1 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            aria-label="Progress"
          >
            <ChartIcon />
          </button>
          <span className={`text-sm font-medium tracking-wide uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {workout?.name || ''}
          </span>
          <button
            onClick={onSettingsClick}
            className={`transition-colors p-1 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col px-6 overflow-hidden">
          {!workout ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No workout selected</p>
              <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Tap the settings icon to create one</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                This workout has no exercises yet.<br />Go to settings to add some.
              </p>
            </div>
          ) : (
            <>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {currentIndex + 1} / {exercises.length}
              </p>
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                {exercise.name || 'Unnamed exercise'}
              </h1>

              {/* Sets */}
              <div className="flex flex-col gap-3 overflow-y-auto pb-2">
                {exercise.sets.map((set, i) => {
                  const actual = actualData[exercise.id]?.sets[i] || { weight: '', reps: '' }
                  return (
                    <div key={i} className={`rounded-2xl px-5 py-4 ${isDark ? 'bg-neutral-900' : 'bg-white shadow-sm'}`}>
                      {/* Set label + target */}
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Set {i + 1}
                        </span>
                        <div className={`text-right text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <div>{set.reps} reps</div>
                          <div>{set.weight} kg</div>
                        </div>
                      </div>

                      {/* Actual inputs */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={actual.weight}
                            onChange={e => updateActual(exercise.id, i, 'weight', e.target.value)}
                            placeholder={String(set.weight)}
                            className={`w-full text-center text-xl font-semibold rounded-xl py-3 outline-none transition-colors ${
                              isDark
                                ? 'bg-neutral-800 text-white placeholder-neutral-600 focus:bg-neutral-700'
                                : 'bg-gray-100 text-gray-900 placeholder-gray-300 focus:bg-gray-200'
                            }`}
                          />
                          <p className={`text-center text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>kg</p>
                        </div>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>×</span>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={actual.reps}
                            onChange={e => updateActual(exercise.id, i, 'reps', e.target.value)}
                            placeholder={String(set.reps)}
                            className={`w-full text-center text-xl font-semibold rounded-xl py-3 outline-none transition-colors ${
                              isDark
                                ? 'bg-neutral-800 text-white placeholder-neutral-600 focus:bg-neutral-700'
                                : 'bg-gray-100 text-gray-900 placeholder-gray-300 focus:bg-gray-200'
                            }`}
                          />
                          <p className={`text-center text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>reps</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Bottom: dots + submit */}
        {workout && exercises.length > 0 && (
          <div className="px-6 pb-10 pt-4 flex flex-col items-center gap-4">
            {exercises.length > 1 && (
              <div className="flex justify-center items-center gap-2">
                {exercises.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? isDark ? 'bg-white w-6' : 'bg-gray-900 w-6'
                        : isDark ? 'bg-neutral-700 w-2 hover:bg-neutral-500' : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className={`w-full py-4 rounded-2xl font-semibold text-base transition-colors ${
                isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              Finish workout
            </button>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <ConfirmDialog
          isDark={isDark}
          onCancel={() => setShowConfirm(false)}
          onConfirm={doSubmit}
        />
      )}
    </>
  )
}
