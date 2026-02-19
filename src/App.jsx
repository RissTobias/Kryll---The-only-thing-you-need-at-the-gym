import { useState, useEffect } from 'react'
import { dbGet, dbSet } from './db'
import WorkoutView from './components/WorkoutView'
import Settings from './components/Settings'
import ProgressView from './components/ProgressView'

function App() {
  const [ready, setReady] = useState(false)
  const [workouts, setWorkouts] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeWorkoutId, setActiveWorkoutId] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showSettings, setShowSettings] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  // Load from IndexedDB on mount, migrate from localStorage if needed
  useEffect(() => {
    async function load() {
      let [w, s, aid, th] = await Promise.all([
        dbGet('workouts'),
        dbGet('sessions'),
        dbGet('activeWorkoutId'),
        dbGet('theme'),
      ])

      // Migrate from localStorage if IndexedDB is empty
      if (!w) { try { w = JSON.parse(localStorage.getItem('workouts')) } catch {} }
      if (!s) { try { s = JSON.parse(localStorage.getItem('sessions')) } catch {} }
      if (!aid) aid = localStorage.getItem('activeWorkoutId') || null
      if (!th) th = localStorage.getItem('theme') || 'dark'

      setWorkouts(w || [])
      setSessions(s || [])
      setActiveWorkoutId(aid)
      setTheme(th)
      setReady(true)
    }
    load()
  }, [])

  // Persist to IndexedDB on state changes (only after initial load)
  useEffect(() => { if (ready) dbSet('workouts', workouts) }, [workouts, ready])
  useEffect(() => { if (ready) dbSet('sessions', sessions) }, [sessions, ready])
  useEffect(() => { if (ready) dbSet('activeWorkoutId', activeWorkoutId) }, [activeWorkoutId, ready])
  useEffect(() => { if (ready) dbSet('theme', theme) }, [theme, ready])

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId) || null

  const handleSubmitSession = (session) => {
    setSessions(prev => [...prev, session])
    setWorkouts(prev => prev.map(w => {
      if (w.id !== session.workoutId) return w
      return {
        ...w,
        exercises: w.exercises.map(ex => {
          const sessionEx = session.exercises.find(se => se.exerciseId === ex.id)
          if (!sessionEx) return ex
          return { ...ex, sets: sessionEx.sets.map(s => ({ weight: s.weight, reps: s.reps })) }
        })
      }
    }))
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!ready) {
    return <div className="h-screen bg-black" />
  }

  return (
    <div className={`h-screen overflow-hidden ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <WorkoutView
        key={activeWorkoutId}
        workout={activeWorkout}
        theme={theme}
        onSettingsClick={() => setShowSettings(true)}
        onProgressClick={() => setShowProgress(true)}
        onSubmitSession={handleSubmitSession}
      />
      {showSettings && (
        <Settings
          workouts={workouts}
          setWorkouts={setWorkouts}
          activeWorkoutId={activeWorkoutId}
          setActiveWorkoutId={setActiveWorkoutId}
          theme={theme}
          onThemeToggle={toggleTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showProgress && (
        <ProgressView
          sessions={sessions}
          workouts={workouts}
          activeWorkoutId={activeWorkoutId}
          theme={theme}
          onClose={() => setShowProgress(false)}
        />
      )}
    </div>
  )
}

export default App
