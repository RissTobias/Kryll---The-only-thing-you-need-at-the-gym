import { useState } from 'react'

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Theme helpers ──────────────────────────────────────────────────────────────

function useThemeClasses(theme) {
  const isDark = theme === 'dark'
  return {
    isDark,
    bg: isDark ? 'bg-black' : 'bg-gray-50',
    bgCard: isDark ? 'bg-neutral-900' : 'bg-white',
    bgInput: isDark ? 'bg-neutral-800 focus:bg-neutral-700' : 'bg-gray-100 focus:bg-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textFaint: isDark ? 'text-gray-600' : 'text-gray-400',
    border: isDark ? 'border-neutral-700' : 'border-gray-200',
    borderHover: isDark ? 'hover:border-neutral-500' : 'hover:border-gray-400',
    placeholder: isDark ? 'placeholder-neutral-700' : 'placeholder-gray-300',
    danger: isDark ? 'text-neutral-600 hover:text-red-400' : 'text-gray-300 hover:text-red-400',
    addBtn: isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900',
    checkActive: isDark ? 'border-white bg-white text-black' : 'border-gray-900 bg-gray-900 text-white',
    checkInactive: isDark ? 'border-neutral-600 hover:border-neutral-400' : 'border-gray-300 hover:border-gray-500',
  }
}

// ── Workout List ───────────────────────────────────────────────────────────────

function WorkoutList({ workouts, activeWorkoutId, theme, onThemeToggle, onSelect, onCreate, onEdit, onDelete, onClose, onSignOut, userEmail }) {
  const t = useThemeClasses(theme)

  return (
    <div className={`flex flex-col h-full ${t.bg} ${t.text}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <h2 className="text-xl font-bold">Settings</h2>
        <button onClick={onClose} className={`text-sm transition-colors ${t.textMuted} hover:${t.text}`}>
          Done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">

        {/* Account */}
        {userEmail && (
          <>
            <p className={`text-xs uppercase tracking-widest mb-3 ${t.textFaint}`}>Account</p>
            <div className={`flex items-center justify-between rounded-2xl px-4 py-4 mb-8 ${t.bgCard}`}>
              <span className={`text-sm truncate mr-3 ${t.textMuted}`}>{userEmail}</span>
              <button
                onClick={onSignOut}
                className={`text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${
                  t.isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Abmelden
              </button>
            </div>
          </>
        )}

        {/* Theme toggle */}
        <p className={`text-xs uppercase tracking-widest mb-3 ${t.textFaint}`}>Appearance</p>
        <div className={`flex items-center justify-between rounded-2xl px-4 py-4 mb-8 ${t.bgCard}`}>
          <span className="font-medium">Dark Mode</span>
          <button
            onClick={onThemeToggle}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-white' : 'bg-gray-300'
            }`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>

        {/* Workouts */}
        <p className={`text-xs uppercase tracking-widest mb-3 ${t.textFaint}`}>Workouts</p>

        {workouts.length === 0 && (
          <p className={`text-sm mb-6 ${t.textMuted}`}>No workouts yet. Create one below.</p>
        )}

        <div className="flex flex-col gap-3 mb-6">
          {workouts.map(workout => (
            <div key={workout.id} className={`flex items-center rounded-2xl px-4 py-4 gap-3 ${t.bgCard}`}>
              <button
                onClick={() => onSelect(workout.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  activeWorkoutId === workout.id ? t.checkActive : t.checkInactive
                }`}
              >
                {activeWorkoutId === workout.id && <CheckIcon />}
              </button>

              <button onClick={() => onEdit(workout)} className="flex-1 text-left">
                <span className="font-medium">{workout.name}</span>
                <span className={`text-sm ml-2 ${t.textMuted}`}>
                  {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                </span>
              </button>

              <button onClick={() => onDelete(workout.id)} className={`transition-colors p-1 ${t.danger}`} aria-label="Delete">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onCreate}
          className={`w-full flex items-center justify-center gap-2 border rounded-2xl py-4 transition-colors ${t.border} ${t.borderHover} ${t.addBtn}`}
        >
          <PlusIcon />
          <span>New Workout</span>
        </button>
      </div>
    </div>
  )
}

// ── Workout Editor ─────────────────────────────────────────────────────────────

function WorkoutEditor({ workout, theme, onSave, onBack }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(workout)))
  const t = useThemeClasses(theme)

  const updateName = (name) => setDraft(d => ({ ...d, name }))

  const addExercise = () => {
    setDraft(d => ({
      ...d,
      exercises: [...d.exercises, { id: crypto.randomUUID(), name: '', sets: [{ weight: '', reps: '' }] }]
    }))
  }

  const updateExerciseName = (exId, name) => {
    setDraft(d => ({ ...d, exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, name } : ex) }))
  }

  const removeExercise = (exId) => {
    setDraft(d => ({ ...d, exercises: d.exercises.filter(ex => ex.id !== exId) }))
  }

  const addSet = (exId) => {
    setDraft(d => ({
      ...d,
      exercises: d.exercises.map(ex =>
        ex.id === exId ? { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] } : ex
      )
    }))
  }

  const updateSet = (exId, setIdx, field, value) => {
    setDraft(d => ({
      ...d,
      exercises: d.exercises.map(ex =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s) }
          : ex
      )
    }))
  }

  const removeSet = (exId, setIdx) => {
    setDraft(d => ({
      ...d,
      exercises: d.exercises.map(ex =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) } : ex
      )
    }))
  }

  const handleSave = () => {
    const cleaned = {
      ...draft,
      name: draft.name.trim() || 'Untitled Workout',
      exercises: draft.exercises.map(ex => ({
        ...ex,
        name: ex.name.trim() || 'Unnamed Exercise',
        sets: ex.sets.map(s => ({
          weight: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps) || 0,
        }))
      }))
    }
    onSave(cleaned)
  }

  return (
    <div className={`flex flex-col h-full ${t.bg} ${t.text}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <button onClick={onBack} className={`transition-colors ${t.textMuted}`}>
          <BackIcon />
        </button>
        <button
          onClick={handleSave}
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
            t.isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {/* Workout name */}
        <input
          type="text"
          value={draft.name}
          onChange={e => updateName(e.target.value)}
          placeholder="Workout name"
          className={`w-full bg-transparent text-2xl font-bold outline-none mb-8 border-b pb-3 ${t.placeholder} ${
            t.isDark ? 'border-neutral-800' : 'border-gray-200'
          }`}
        />

        {/* Exercises */}
        <div className="flex flex-col gap-6">
          {draft.exercises.map((exercise, exIdx) => (
            <div key={exercise.id} className={`rounded-2xl p-4 ${t.bgCard}`}>
              {/* Exercise header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm w-5 ${t.textFaint}`}>{exIdx + 1}</span>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={e => updateExerciseName(exercise.id, e.target.value)}
                  placeholder="Exercise name"
                  className={`flex-1 bg-transparent font-semibold outline-none ${t.placeholder}`}
                />
                <button onClick={() => removeExercise(exercise.id)} className={`transition-colors ${t.danger}`}>
                  <TrashIcon />
                </button>
              </div>

              {/* Sets column headers */}
              {exercise.sets.length > 0 && (
                <div className={`flex text-xs uppercase tracking-wider mb-2 px-1 ${t.textFaint}`}>
                  <span className="w-14">Set</span>
                  <span className="flex-1">Weight (kg)</span>
                  <span className="w-16 text-center">Reps</span>
                  <span className="w-6" />
                </div>
              )}

              {/* Sets */}
              <div className="flex flex-col gap-2 mb-3">
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-2">
                    <span className={`text-sm w-14 ${t.textFaint}`}>Set {setIdx + 1}</span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={e => updateSet(exercise.id, setIdx, 'weight', e.target.value)}
                      placeholder="0"
                      className={`flex-1 rounded-xl px-3 py-2 text-center outline-none transition-colors ${t.bgInput}`}
                    />
                    <span className={t.textFaint}>×</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={e => updateSet(exercise.id, setIdx, 'reps', e.target.value)}
                      placeholder="0"
                      className={`w-16 rounded-xl px-3 py-2 text-center outline-none transition-colors ${t.bgInput}`}
                    />
                    <button onClick={() => removeSet(exercise.id, setIdx)} className={`w-6 flex items-center justify-center transition-colors ${t.danger}`}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => addSet(exercise.id)} className={`flex items-center gap-1 text-sm transition-colors px-1 ${t.addBtn}`}>
                <PlusIcon />
                Add set
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addExercise}
          className={`w-full flex items-center justify-center gap-2 border rounded-2xl py-4 mt-6 transition-colors ${t.border} ${t.borderHover} ${t.addBtn}`}
        >
          <PlusIcon />
          <span>Add Exercise</span>
        </button>
      </div>
    </div>
  )
}

// ── Main Settings Component ────────────────────────────────────────────────────

export default function Settings({ workouts, activeWorkoutId, setActiveWorkoutId, theme, onThemeToggle, onSaveWorkout, onDeleteWorkout, onSignOut, userEmail, onClose }) {
  const [editingWorkout, setEditingWorkout] = useState(null)

  const handleCreate = () => {
    setEditingWorkout({ id: crypto.randomUUID(), name: '', exercises: [] })
  }

  const handleEdit = (workout) => {
    setEditingWorkout(JSON.parse(JSON.stringify(workout)))
  }

  const handleSave = (saved) => {
    onSaveWorkout(saved)
    setEditingWorkout(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {editingWorkout ? (
        <WorkoutEditor
          workout={editingWorkout}
          theme={theme}
          onSave={handleSave}
          onBack={() => setEditingWorkout(null)}
        />
      ) : (
        <WorkoutList
          workouts={workouts}
          activeWorkoutId={activeWorkoutId}
          theme={theme}
          onThemeToggle={onThemeToggle}
          onSelect={setActiveWorkoutId}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={onDeleteWorkout}
          onClose={onClose}
          onSignOut={onSignOut}
          userEmail={userEmail}
        />
      )}
    </div>
  )
}
