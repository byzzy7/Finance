import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Kategorie } from '../types'
import type { KategorieVstup } from '../api/kategorie'
import { formatKc } from '../utils/format'

interface Props {
  kategorie: Kategorie[]
  vydajeMesice: Map<number, number>
  onCreate: (data: KategorieVstup) => Promise<void>
  onUpdate: (data: KategorieVstup & { id: number }) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const PRAZDNY_FORMULAR: KategorieVstup = { nazev: '', ikona: '📦', barva: '#94a3b8', mesicni_limit: null, poradi: 0 }

export default function CategoryManager({ kategorie, vydajeMesice, onCreate, onUpdate, onDelete }: Props) {
  const [upravovaneId, setUpravovaneId] = useState<number | null>(null)
  const [formular, setFormular] = useState<KategorieVstup>(PRAZDNY_FORMULAR)
  const [zobrazitFormular, setZobrazitFormular] = useState(false)

  function zacniUpravovat(k: Kategorie) {
    setUpravovaneId(k.id)
    setFormular({ nazev: k.nazev, ikona: k.ikona, barva: k.barva, mesicni_limit: k.mesicni_limit, poradi: k.poradi })
    setZobrazitFormular(true)
  }

  function zacniPridavat() {
    setUpravovaneId(null)
    setFormular({ ...PRAZDNY_FORMULAR, poradi: kategorie.length })
    setZobrazitFormular(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!formular.nazev.trim()) return
    if (upravovaneId) {
      await onUpdate({ ...formular, id: upravovaneId })
    } else {
      await onCreate(formular)
    }
    setZobrazitFormular(false)
  }

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/70">Kategorie a rozpočtové limity</h2>
        <button
          onClick={zacniPridavat}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:border-accent hover:text-white"
        >
          + Nová kategorie
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {kategorie.map((k) => {
          const utraceno = vydajeMesice.get(k.id) ?? 0
          const limit = k.mesicni_limit
          const procenta = limit ? Math.min(100, Math.round((utraceno / limit) * 100)) : null
          return (
            <li key={k.id} className="rounded-lg border border-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{k.ikona}</span>
                  <span className="font-medium">{k.nazev}</span>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: k.barva }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => zacniUpravovat(k)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-accent hover:text-white"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => void onDelete(k.id)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-expense/80 hover:border-expense hover:text-expense"
                  >
                    Smazat
                  </button>
                </div>
              </div>
              {limit != null && (
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-xs text-white/50">
                    <span>
                      {formatKc(utraceno)} / {formatKc(limit)}
                    </span>
                    <span>{procenta}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${procenta}%`,
                        backgroundColor: (procenta ?? 0) >= 100 ? 'var(--color-expense)' : k.barva,
                      }}
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {zobrazitFormular && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="k-ikona" className="mb-1 block text-xs text-white/60">Ikona (emoji)</label>
              <input
                id="k-ikona"
                value={formular.ikona}
                onChange={(e) => setFormular((f) => ({ ...f, ikona: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="k-barva" className="mb-1 block text-xs text-white/60">Barva</label>
              <input
                id="k-barva"
                type="color"
                value={formular.barva}
                onChange={(e) => setFormular((f) => ({ ...f, barva: e.target.value }))}
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5"
              />
            </div>
          </div>
          <div>
            <label htmlFor="k-nazev" className="mb-1 block text-xs text-white/60">Název</label>
            <input
              id="k-nazev"
              value={formular.nazev}
              onChange={(e) => setFormular((f) => ({ ...f, nazev: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="k-limit" className="mb-1 block text-xs text-white/60">Měsíční limit (Kč, nepovinné)</label>
            <input
              id="k-limit"
              type="number"
              min="0"
              step="0.01"
              value={formular.mesicni_limit ?? ''}
              onChange={(e) =>
                setFormular((f) => ({ ...f, mesicni_limit: e.target.value === '' ? null : parseFloat(e.target.value) }))
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="gradient-btn flex-1 rounded-lg py-1.5 text-sm font-medium text-white">
              Uložit
            </button>
            <button
              type="button"
              onClick={() => setZobrazitFormular(false)}
              className="flex-1 rounded-lg border border-white/10 py-1.5 text-sm text-white/70"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
