import { api } from './client'
import type { Filtr, UlozenyFiltr } from '../types'

export const filtryApi = {
  list: () => api.get<UlozenyFiltr[]>('/filtry.php'),
  create: (nazev: string, filtr: Filtr) => api.post<{ id: number }>('/filtry.php', { nazev, filtr }),
  remove: (id: number) => api.del<{ message: string }>('/filtry.php', { id }),
}
