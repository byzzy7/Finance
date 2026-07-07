import { api } from './client'
import type { Clen } from '../types'

export interface NovyClen {
  uzivatelske_jmeno: string
  heslo: string
  jmeno: string
  barva?: string
}

export const clenoveApi = {
  list: () => api.get<Clen[]>('/clenove.php'),
  create: (data: NovyClen) => api.post<Clen>('/clenove.php', data),
}
