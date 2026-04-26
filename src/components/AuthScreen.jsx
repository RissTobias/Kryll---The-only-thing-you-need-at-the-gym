import { useState } from 'react'
import { useAuth } from '../auth-context'

export default function AuthScreen({ theme = 'dark' }) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const isDark = theme === 'dark'

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email.trim() || !password) {
      setError('Email und Passwort eingeben.')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (error) throw error
      } else if (mode === 'signup') {
        const { data, error } = await signUp(email.trim(), password)
        if (error) throw error
        if (!data.session) {
          setInfo('Account erstellt. Schau in deine E-Mails zur Bestätigung.')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email.trim())
        if (error) throw error
        setInfo('Wenn ein Account existiert, schicken wir dir einen Reset-Link.')
      }
    } catch (err) {
      setError(err.message || 'Etwas ist schiefgelaufen.')
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setInfo(null)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Kryll</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {mode === 'signin' && 'Melde dich an um weiterzumachen'}
            {mode === 'signup' && 'Erstelle deinen Account'}
            {mode === 'reset' && 'Passwort zurücksetzen'}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail"
            className={`rounded-2xl px-5 py-4 outline-none transition-colors ${
              isDark
                ? 'bg-neutral-900 placeholder-neutral-600 focus:bg-neutral-800'
                : 'bg-white placeholder-gray-300 focus:bg-gray-100 shadow-sm'
            }`}
          />

          {mode !== 'reset' && (
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Passwort"
              className={`rounded-2xl px-5 py-4 outline-none transition-colors ${
                isDark
                  ? 'bg-neutral-900 placeholder-neutral-600 focus:bg-neutral-800'
                  : 'bg-white placeholder-gray-300 focus:bg-gray-100 shadow-sm'
              }`}
            />
          )}

          {error && (
            <p className="text-sm text-red-400 text-center px-2">{error}</p>
          )}
          {info && (
            <p className={`text-sm text-center px-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{info}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`mt-2 py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50 ${
              isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {busy ? '…' : mode === 'signin' ? 'Anmelden' : mode === 'signup' ? 'Account erstellen' : 'Reset-Link senden'}
          </button>
        </form>

        <div className={`mt-6 text-sm text-center space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {mode === 'signin' && (
            <>
              <button onClick={() => switchMode('signup')} className="underline-offset-2 hover:underline">
                Noch keinen Account? Registrieren
              </button>
              <div>
                <button onClick={() => switchMode('reset')} className="underline-offset-2 hover:underline">
                  Passwort vergessen?
                </button>
              </div>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => switchMode('signin')} className="underline-offset-2 hover:underline">
              Schon einen Account? Anmelden
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => switchMode('signin')} className="underline-offset-2 hover:underline">
              Zurück zum Anmelden
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
