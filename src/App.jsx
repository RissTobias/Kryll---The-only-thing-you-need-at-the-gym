import { useEffect, useRef, useState } from 'react'
import { useAuth } from './auth-context.js'
import {
  fetchWorkouts, upsertWorkout, deleteWorkout as deleteWorkoutRow,
  fetchSessions, insertSession,
  fetchSettings, upsertSettings,
} from './data.js'
import WorkoutView from './components/WorkoutView'
import Settings from './components/Settings'
import ProgressView from './components/ProgressView'
import AuthScreen from './components/AuthScreen'

function AuthenticatedApp({ user, signOut }) {
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeWorkoutId, setActiveWorkoutId] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showSettings, setShowSettings] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const lastSettingsRef = useRef({ activeWorkoutId: null, theme: 'dark' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [w, s, settings] = await Promise.all([
          fetchWorkouts(user.id),
          fetchSessions(user.id),
          fetchSettings(user.id),
        ])
        if (cancelled) return
        setWorkouts(w)
        setSessions(s)
        setActiveWorkoutId(settings.activeWorkoutId)
        setTheme(settings.theme || 'dark')
        lastSettingsRef.current = {
          activeWorkoutId: settings.activeWorkoutId,
          theme: settings.theme || 'dark',
        }
        setReady(true)
      } catch (err) {
        if (cancelled) return
        setLoadError(err.message || 'Daten konnten nicht geladen werden.')
        setReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [user.id])

  useEffect(() => {
    if (!ready) return
    const last = lastSettingsRef.current
    if (last.activeWorkoutId === activeWorkoutId && last.theme === theme) return
    lastSettingsRef.current = { activeWorkoutId, theme }
    upsertSettings(user.id, { activeWorkoutId, theme }).catch(err => {
      console.error('Settings sync failed:', err)
    })
  }, [activeWorkoutId, theme, ready, user.id])

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId) || null

  const handleSaveWorkout = async (saved) => {
    const exists = workouts.some(w => w.id === saved.id)
    setWorkouts(prev => exists ? prev.map(w => w.id === saved.id ? saved : w) : [...prev, saved])
    if (!exists && !activeWorkoutId) setActiveWorkoutId(saved.id)
    try {
      await upsertWorkout(user.id, saved)
    } catch (err) {
      console.error('Workout save failed:', err)
      alert('Konnte Training nicht speichern: ' + err.message)
    }
  }

  const handleDeleteWorkout = async (id) => {
    const prev = workouts
    setWorkouts(workouts.filter(w => w.id !== id))
    if (activeWorkoutId === id) setActiveWorkoutId(null)
    try {
      await deleteWorkoutRow(id)
    } catch (err) {
      console.error('Workout delete failed:', err)
      setWorkouts(prev)
      alert('Konnte Training nicht löschen: ' + err.message)
    }
  }

  const handleSubmitSession = async (session) => {
    setSessions(prev => [...prev, session])
    const updatedWorkout = (() => {
      const w = workouts.find(x => x.id === session.workoutId)
      if (!w) return null
      return {
        ...w,
        exercises: w.exercises.map(ex => {
          const sessionEx = session.exercises.find(se => se.exerciseId === ex.id)
          if (!sessionEx) return ex
          return { ...ex, sets: sessionEx.sets.map(s => ({ weight: s.weight, reps: s.reps })) }
        })
      }
    })()
    if (updatedWorkout) {
      setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w))
    }
    try {
      await insertSession(user.id, session)
      if (updatedWorkout) await upsertWorkout(user.id, updatedWorkout)
    } catch (err) {
      console.error('Session save failed:', err)
      alert('Konnte Training nicht speichern: ' + err.message)
    }
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!ready) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
        Lade…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center px-6 gap-4 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <p className="text-red-400 text-sm text-center">{loadError}</p>
        <button onClick={() => signOut()} className="text-sm underline">Abmelden</button>
      </div>
    )
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
          activeWorkoutId={activeWorkoutId}
          setActiveWorkoutId={setActiveWorkoutId}
          theme={theme}
          onThemeToggle={toggleTheme}
          onSaveWorkout={handleSaveWorkout}
          onDeleteWorkout={handleDeleteWorkout}
          onSignOut={signOut}
          userEmail={user.email}
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

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div className="h-screen bg-black" />
  if (!user) return <AuthScreen theme="dark" />
  return <AuthenticatedApp key={user.id} user={user} signOut={signOut} />
}
