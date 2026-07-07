import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Clen } from '../types'
import type { NovyClen } from '../api/clenove'
import { ApiError } from '../api/client'

interface Props {
  clenove: Clen[]
  onCreate: (data: NovyClen) => Promise<void>
}

const PRAZDNY: NovyClen = { uzivatelske_jmeno: '', heslo: '', jmeno: '', barva: '#7c5cff' }

export default function MemberManager({ clenove, onCreate }: Props) {
  const [zobrazitFormular, setZobrazitFormular] = useState(false)
  const [formular, setFormular] = useState<NovyClen>(PRAZDNY)
  const [chyba, setChyba] = useState<string | null>(null)
  const [odesilani, setOdesilani] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setChyba(null)
    setOdesilani(true)
    try {
      await onCreate(formular)
      setFormular(PRAZDNY)
      setZobrazitFormular(false)
    } catch (error) {
      setChyba(error instanceof ApiError ? error.message : 'Nepodařilo se vytvořit člena.')
    } finally {
      setOdesilani(false)
    }
  }

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/70">Členové rodiny</h2>
        <button
          onClick={() => setZobrazitFormular((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:border-accent hover:text-white"
        >
          + Přidat člena
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {clenove.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: c.barva }}>
              {c.jmeno.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="font-medium">{c.jmeno}</div>
              <div className="text-xs text-white/40">@{c.uzivatelske_jmeno}</div>
            </div>
          </li>
        ))}
      </ul>

      {zobrazitFormular && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 p-4">
          <div>
            <label htmlFor="c-jmeno" className="mb-1 block text-xs text-white/60">Jméno</label>
            <input
              id="c-jmeno"
              value={formular.jmeno}
              onChange={(e) => setFormular((f) => ({ ...f, jmeno: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="c-username" className="mb-1 block text-xs text-white/60">Uživatelské jméno</label>
            <input
              id="c-username"
              value={formular.uzivatelske_jmeno}
              onChange={(e) => setFormular((f) => ({ ...f, uzivatelske_jmeno: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="c-heslo" className="mb-1 block text-xs text-white/60">Heslo (min. 6 znaků)</label>
            <input
              id="c-heslo"
              type="password"
              value={formular.heslo}
              onChange={(e) => setFormular((f) => ({ ...f, heslo: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              minLength={6}
              required
            />
          </div>
          <div>
            <label htmlFor="c-barva" className="mb-1 block text-xs text-white/60">Barva avataru</label>
            <input
              id="c-barva"
              type="color"
              value={formular.barva}
              onChange={(e) => setFormular((f) => ({ ...f, barva: e.target.value }))}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5"
            />
          </div>

          {chyba && <p className="text-sm text-expense">{chyba}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={odesilani}
              className="gradient-btn flex-1 rounded-lg py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {odesilani ? 'Vytváření…' : 'Vytvořit'}
            </button>
            <button
              type="button"
              onClick={() => setZobrazitFormular(false)}
              className="flex-1 rounded-lg border border-white/10 py-1.5 text-sm text-white/70"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
