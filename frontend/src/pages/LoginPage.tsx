import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

export default function LoginPage() {
  const { clen, nacitani, prihlasit } = useAuth()
  const [jmeno, setJmeno] = useState('')
  const [heslo, setHeslo] = useState('')
  const [chyba, setChyba] = useState<string | null>(null)
  const [odesilani, setOdesilani] = useState(false)

  if (!nacitani && clen) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setChyba(null)
    setOdesilani(true)
    try {
      await prihlasit(jmeno, heslo)
    } catch (error) {
      setChyba(error instanceof ApiError ? error.message : 'Přihlášení se nezdařilo.')
    } finally {
      setOdesilani(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="glass glow-ring w-full max-w-sm p-8">
        <h1 className="gradient-text mb-1 text-2xl font-semibold">Finanční přehled</h1>
        <p className="mb-6 text-sm text-white/50">Přihlaste se do rodinného účtu</p>

        <label className="mb-1 block text-sm text-white/70" htmlFor="jmeno">
          Uživatelské jméno
        </label>
        <input
          id="jmeno"
          value={jmeno}
          onChange={(e) => setJmeno(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
          autoComplete="username"
          required
        />

        <label className="mb-1 block text-sm text-white/70" htmlFor="heslo">
          Heslo
        </label>
        <input
          id="heslo"
          type="password"
          value={heslo}
          onChange={(e) => setHeslo(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
          autoComplete="current-password"
          required
        />

        {chyba && <p className="mb-4 text-sm text-expense">{chyba}</p>}

        <button
          type="submit"
          disabled={odesilani}
          className="gradient-btn w-full rounded-lg py-2 font-medium text-white disabled:opacity-60"
        >
          {odesilani ? 'Přihlašování…' : 'Přihlásit se'}
        </button>
      </form>
    </div>
  )
}
