import { Doughnut } from 'react-chartjs-2'
import type { Transakce } from '../types'

export default function CategoryChart({ transakce }: { transakce: Transakce[] }) {
  const vydaje = transakce.filter((t) => t.typ === 'vydaj')

  const souhrn = new Map<string, { castka: number; barva: string }>()
  vydaje.forEach((t) => {
    const existujici = souhrn.get(t.kategorie_nazev)
    const castka = parseFloat(t.castka)
    if (existujici) {
      existujici.castka += castka
    } else {
      souhrn.set(t.kategorie_nazev, { castka, barva: t.kategorie_barva })
    }
  })

  const labels = Array.from(souhrn.keys())
  const values = labels.map((label) => souhrn.get(label)!.castka)
  const colors = labels.map((label) => souhrn.get(label)!.barva)

  if (labels.length === 0) {
    return (
      <div className="glass flex h-72 items-center justify-center p-5 text-white/40">
        Zatím žádné výdaje k zobrazení
      </div>
    )
  }

  return (
    <div className="glass p-5">
      <h2 className="mb-4 text-sm font-medium text-white/70">Výdaje podle kategorie</h2>
      <div className="h-64">
        <Doughnut
          data={{
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderColor: 'rgba(11,11,20,0.8)', borderWidth: 2 }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${Number(ctx.parsed).toLocaleString('cs-CZ')} Kč`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}
