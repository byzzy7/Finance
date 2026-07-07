import { api } from './client'
import type { Kategorie } from '../types'

export type KategorieVstup = Omit<Kategorie, 'id'> & { id?: number }

export const kategorieApi = {
  list: () => api.get<Kategorie[]>('/kategorie.php'),
  create: (data: KategorieVstup) => api.post<{ id: number }>('/kategorie.php', data),
  update: (data: KategorieVstup & { id: number }) => api.put<{ message: string }>('/kategorie.php', data),
  remove: (id: number) => api.del<{ message: string }>('/kategorie.php', { id }),
}
