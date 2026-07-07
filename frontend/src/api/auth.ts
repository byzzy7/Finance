import { api } from './client'
import type { Clen } from '../types'

export const authApi = {
  login: (uzivatelske_jmeno: string, heslo: string) =>
    api.post<Clen>('/auth/login.php', { uzivatelske_jmeno, heslo }),
  logout: () => api.post<{ message: string }>('/auth/logout.php'),
  me: () => api.get<Clen>('/auth/me.php'),
}
