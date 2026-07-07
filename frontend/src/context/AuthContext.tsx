import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import type { Clen } from '../types'

interface AuthContextValue {
  clen: Clen | null
  nacitani: boolean
  prihlasit: (jmeno: string, heslo: string) => Promise<void>
  odhlasit: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clen, setClen] = useState<Clen | null>(null)
  const [nacitani, setNacitani] = useState(true)

  useEffect(() => {
    authApi
      .me()
      .then(setClen)
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error('Chyba při ověřování přihlášení:', error)
        }
        setClen(null)
      })
      .finally(() => setNacitani(false))
  }, [])

  const prihlasit = useCallback(async (jmeno: string, heslo: string) => {
    const clenData = await authApi.login(jmeno, heslo)
    setClen(clenData)
  }, [])

  const odhlasit = useCallback(async () => {
    await authApi.logout()
    setClen(null)
  }, [])

  return (
    <AuthContext.Provider value={{ clen, nacitani, prihlasit, odhlasit }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth musí být použit uvnitř AuthProvider')
  return ctx
}
