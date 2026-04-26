import { supabase } from './supabase'

// Workouts ─────────────────────────────────────────────────────────────────────

export async function fetchWorkouts(userId) {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, exercises, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(row => ({
    id: row.id,
    name: row.name,
    exercises: row.exercises ?? [],
  }))
}

export async function upsertWorkout(userId, workout) {
  const { error } = await supabase.from('workouts').upsert({
    id: workout.id,
    user_id: userId,
    name: workout.name,
    exercises: workout.exercises,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function deleteWorkout(workoutId) {
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
  if (error) throw error
}

// Sessions ─────────────────────────────────────────────────────────────────────

export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, workout_id, workout_name, date, exercises')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw error
  return data.map(row => ({
    id: row.id,
    workoutId: row.workout_id,
    workoutName: row.workout_name,
    date: row.date,
    exercises: row.exercises ?? [],
  }))
}

export async function insertSession(userId, session) {
  const { error } = await supabase.from('sessions').insert({
    id: session.id,
    user_id: userId,
    workout_id: session.workoutId,
    workout_name: session.workoutName,
    date: session.date,
    exercises: session.exercises,
  })
  if (error) throw error
}

// Settings (active workout, theme) ─────────────────────────────────────────────

export async function fetchSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('active_workout_id, theme')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
    ? { activeWorkoutId: data.active_workout_id, theme: data.theme }
    : { activeWorkoutId: null, theme: 'dark' }
}

export async function upsertSettings(userId, { activeWorkoutId, theme }) {
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    active_workout_id: activeWorkoutId,
    theme,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
