import { api } from './client'
import type { WidgetStav } from '../types'

export const rozlozeniApi = {
  get: () => api.get<WidgetStav[] | null>('/rozlozeni.php'),
  save: (rozlozeni: WidgetStav[]) => api.post<{ message: string }>('/rozlozeni.php', { rozlozeni }),
}
