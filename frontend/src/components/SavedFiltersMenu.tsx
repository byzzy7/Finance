import { useState } from 'react'
import type { Filtr, UlozenyFiltr } from '../types'

interface Props {
  ulozene: UlozenyFiltr[]
  filtr: Filtr
  onApply: (filtr: Filtr) => void
  onSave: (nazev: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function SavedFiltersMenu({ ulozene, filtr, onApply, onSave, onDelete }: Props) {
  const [otevreno, setOtevreno] = useState(false)
  const [nazev, setNazev] = useState('')

  async function handleSave() {
    if (!nazev.trim()) return
    await onSave(nazev.trim())
    setNazev('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOtevreno((v) => !v)}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:border-accent hover:text-white"
      >
        ⭐ Uložené filtry
      </button>

      {otevreno && (
        <div className="glass absolute right-0 z-40 mt-2 w-72 p-4">
          <div className="mb-3 flex gap-2">
            <input
              value={nazev}
              onChange={(e) => setNazev(e.target.value)}
              placeholder="Název filtru"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={() => void handleSave()}
              className="gradient-btn rounded-lg px-3 py-1.5 text-sm text-white"
            >
              Uložit
            </button>
          </div>

          {ulozene.length === 0 ? (
            <p className="text-sm text-white/40">Zatím žádné uložené filtry.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {ulozene.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5">
                  <button
                    onClick={() => {
                      onApply(f.filtr)
                      setOtevreno(false)
                    }}
                    className={`flex-1 truncate text-left text-sm ${
                      JSON.stringify(f.filtr) === JSON.stringify(filtr) ? 'text-accent' : 'text-white/80'
                    }`}
                  >
                    {f.nazev}
                  </button>
                  <button
                    onClick={() => void onDelete(f.id)}
                    className="ml-2 text-xs text-white/40 hover:text-expense"
                    aria-label={`Smazat filtr ${f.nazev}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
