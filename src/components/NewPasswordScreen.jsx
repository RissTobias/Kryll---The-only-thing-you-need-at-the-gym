import { useState } from 'react'
import { useAuth } from '../auth-context'

export default function NewPasswordScreen({ theme = 'dark' }) {
  const { updatePassword, clearRecovery, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const isDark = theme === 'dark'

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.')
      return
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    setBusy(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      setDone(true)
      clearRecovery()
    } catch (err) {
      setError(err.message || 'Etwas ist schiefgelaufen.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-5xl mb-2">✓</div>
        <h2 className="text-2xl font-bold">Passwort geändert</h2>
        <p className={`text-sm max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Du bist jetzt mit dem neuen Passwort eingeloggt.
        </p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Neues Passwort</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Wähle ein neues Passwort für deinen Account
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Neues Passwort"
            className={`rounded-2xl px-5 py-4 outline-none transition-colors ${
              isDark
                ? 'bg-neutral-900 placeholder-neutral-600 focus:bg-neutral-800'
                : 'bg-white placeholder-gray-300 focus:bg-gray-100 shadow-sm'
            }`}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Passwort bestätigen"
            className={`rounded-2xl px-5 py-4 outline-none transition-colors ${
              isDark
                ? 'bg-neutral-900 placeholder-neutral-600 focus:bg-neutral-800'
                : 'bg-white placeholder-gray-300 focus:bg-gray-100 shadow-sm'
            }`}
          />

          {error && <p className="text-sm text-red-400 text-center px-2">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className={`mt-2 py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50 ${
              isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {busy ? '…' : 'Passwort speichern'}
          </button>
        </form>

        <div className={`mt-6 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <button
            onClick={async () => { await signOut(); clearRecovery() }}
            className="underline-offset-2 hover:underline"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
