import { api } from './client'
import type { Filtr, Transakce, TypTransakce } from '../types'

export interface TransakceVstup {
  typ: TypTransakce
  popis: string
  kategorie_id: number
  castka: number
  datum: string
}

function buildQuery(filtr: Partial<Filtr>): string {
  const params = new URLSearchParams()
  if (filtr.mesic && filtr.mesic !== 'all') params.set('mesic', filtr.mesic)
  if (filtr.kategorie_id && filtr.kategorie_id !== 'all') params.set('kategorie_id', filtr.kategorie_id)
  if (filtr.clen_id && filtr.clen_id !== 'all') params.set('clen_id', filtr.clen_id)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const transakceApi = {
  list: (filtr: Partial<Filtr> = {}) => api.get<Transakce[]>(`/transakce.php${buildQuery(filtr)}`),
  create: (data: TransakceVstup) => api.post<{ id: number }>('/transakce.php', data),
  update: (id: number, data: TransakceVstup) => api.put<{ message: string }>('/transakce.php', { id, ...data }),
  remove: (id: number) => api.del<{ message: string }>('/transakce.php', { id }),
}
