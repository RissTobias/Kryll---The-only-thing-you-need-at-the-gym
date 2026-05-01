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
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setBusy(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      setDone(true)
      clearRecovery()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-5xl mb-2">✓</div>
        <h2 className="text-2xl font-bold">Password changed</h2>
        <p className={`text-sm max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          You're now signed in with the new password.
        </p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">New password</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose a new password for your account
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
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
            placeholder="Confirm password"
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
            {busy ? '…' : 'Save password'}
          </button>
        </form>

        <div className={`mt-6 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <button
            onClick={async () => { await signOut(); clearRecovery() }}
            className="underline-offset-2 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
