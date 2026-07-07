import { Bar } from 'react-chartjs-2'
import type { Transakce } from '../types'

const NAZVY_MESICU = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro']

export default function TrendChart({ transakce }: { transakce: Transakce[] }) {
  const mesice = new Map<string, { prijmy: number; vydaje: number }>()

  transakce.forEach((t) => {
    const klic = t.datum.substring(0, 7)
    const zaznam = mesice.get(klic) ?? { prijmy: 0, vydaje: 0 }
    const castka = parseFloat(t.castka)
    if (t.typ === 'prijem') zaznam.prijmy += castka
    else zaznam.vydaje += castka
    mesice.set(klic, zaznam)
  })

  const klice = Array.from(mesice.keys()).sort().slice(-6)
  const labels = klice.map((klic) => {
    const [rok, mesic] = klic.split('-')
    return `${NAZVY_MESICU[parseInt(mesic, 10) - 1]} ${rok.slice(2)}`
  })

  if (klice.length === 0) {
    return (
      <div className="glass flex h-72 items-center justify-center p-5 text-white/40">
        Zatím žádná data pro trend
      </div>
    )
  }

  return (
    <div className="glass p-5">
      <h2 className="mb-4 text-sm font-medium text-white/70">Trend příjmů a výdajů</h2>
      <div className="h-64">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Příjmy',
                data: klice.map((k) => mesice.get(k)!.prijmy),
                backgroundColor: 'rgba(34,197,94,0.7)',
                borderRadius: 6,
              },
              {
                label: 'Výdaje',
                data: klice.map((k) => mesice.get(k)!.vydaje),
                backgroundColor: 'rgba(248,113,113,0.7)',
                borderRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString('cs-CZ')} Kč`,
                },
              },
            },
            scales: {
              x: { grid: { display: false } },
              y: { ticks: { callback: (value) => `${Number(value).toLocaleString('cs-CZ')} Kč` } },
            },
          }}
        />
      </div>
    </div>
  )
}
