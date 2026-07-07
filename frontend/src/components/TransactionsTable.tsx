import type { Transakce } from '../types'
import { formatKc } from '../utils/format'

interface Props {
  transakce: Transakce[]
  onEdit: (t: Transakce) => void
  onDelete: (t: Transakce) => void
}

export default function TransactionsTable({ transakce, onEdit, onDelete }: Props) {
  const serazene = [...transakce].sort((a, b) => b.datum.localeCompare(a.datum) || b.id - a.id)

  return (
    <div className="glass overflow-hidden p-5">
      <h2 className="mb-4 text-sm font-medium text-white/70">Transakce ({transakce.length})</h2>
      <div className="max-h-[28rem] overflow-y-auto overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/50">
              <th className="pb-2 font-medium">Kategorie</th>
              <th className="pb-2 font-medium">Popis</th>
              <th className="pb-2 font-medium">Člen</th>
              <th className="pb-2 font-medium">Částka</th>
              <th className="pb-2 font-medium">Datum</th>
              <th className="pb-2 font-medium">Akce</th>
            </tr>
          </thead>
          <tbody>
            {serazene.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 pr-2">
                  <span className="mr-1">{t.kategorie_ikona}</span>
                  {t.kategorie_nazev}
                </td>
                <td className="py-2 pr-2">{t.popis}</td>
                <td className="py-2 pr-2 text-white/60">{t.clen_jmeno}</td>
                <td className={`py-2 pr-2 font-medium ${t.typ === 'prijem' ? 'text-income' : 'text-expense'}`}>
                  {t.typ === 'prijem' ? '+' : '−'}
                  {formatKc(parseFloat(t.castka))}
                </td>
                <td className="py-2 pr-2 text-white/60">{t.datum}</td>
                <td className="py-2 pr-2">
                  <button
                    onClick={() => onEdit(t)}
                    className="mr-2 rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-accent hover:text-white"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-expense/80 hover:border-expense hover:text-expense"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
            {serazene.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/40">
                  Žádné transakce neodpovídají filtru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
