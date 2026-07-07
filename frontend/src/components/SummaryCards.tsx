import type { Transakce } from '../types'
import { formatKc } from '../utils/format'

export default function SummaryCards({ transakce }: { transakce: Transakce[] }) {
  const prijmy = transakce.filter((t) => t.typ === 'prijem').reduce((sum, t) => sum + parseFloat(t.castka), 0)
  const vydaje = transakce.filter((t) => t.typ === 'vydaj').reduce((sum, t) => sum + parseFloat(t.castka), 0)
  const zustatek = prijmy - vydaje

  const karty = [
    { label: 'Celkem příjmy', hodnota: prijmy, barva: 'text-income' },
    { label: 'Celkem výdaje', hodnota: vydaje, barva: 'text-expense' },
    { label: 'Zůstatek', hodnota: zustatek, barva: zustatek < 0 ? 'text-expense' : 'text-income' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {karty.map((karta) => (
        <div key={karta.label} className="glass glass-hover p-5">
          <div className="text-sm text-white/50">{karta.label}</div>
          <div className={`mt-1 text-2xl font-semibold ${karta.barva}`}>{formatKc(karta.hodnota)}</div>
        </div>
      ))}
    </div>
  )
}
