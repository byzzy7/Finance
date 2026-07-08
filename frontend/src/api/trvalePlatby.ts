import { api } from './client'
import type { PeriodaPlatby, TrvalaPlatba, TypTransakce } from '../types'

export interface TrvalaPlatbaVstup {
  typ: TypTransakce
  popis: string
  kategorie_id: number
  castka: number
  perioda: PeriodaPlatby
  dalsi_datum: string
  aktivni: boolean
}

export const trvalePlatbyApi = {
  list: () => api.get<TrvalaPlatba[]>('/trvale_platby.php'),
  create: (data: TrvalaPlatbaVstup) => api.post<{ id: number }>('/trvale_platby.php', data),
  update: (id: number, data: TrvalaPlatbaVstup) => api.put<{ message: string }>('/trvale_platby.php', { id, ...data }),
  remove: (id: number) => api.del<{ message: string }>('/trvale_platby.php', { id }),
}
