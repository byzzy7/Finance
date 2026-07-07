import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function initily(jmeno: string): string {
  return jmeno
    .split(' ')
    .map((cast) => cast[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Layout({ children }: { children: ReactNode }) {
  const { clen, odhlasit } = useAuth()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
    }`

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl min-w-0 flex-col gap-6 p-4 sm:p-6">
      <header className="glass flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="gradient-text text-lg font-semibold">Finance</span>
        </div>

        <nav className="order-3 flex w-full basis-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:basis-auto sm:justify-start">
          <NavLink to="/" end className={navClass}>
            Přehled
          </NavLink>
          <NavLink to="/nastaveni" className={navClass}>
            Nastavení
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {clen && (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: clen.barva }}
              title={clen.jmeno}
            >
              {initily(clen.jmeno)}
            </div>
          )}
          <button
            onClick={() => void odhlasit()}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
          >
            Odhlásit
          </button>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
