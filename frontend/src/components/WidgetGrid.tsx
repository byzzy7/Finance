import { useState } from 'react'
import type { ReactNode } from 'react'
import type { WidgetStav } from '../types'

export interface WidgetDef {
  id: string
  nazev: string
  node: ReactNode
}

interface Props {
  widgety: WidgetDef[]
  rozlozeni: WidgetStav[] | null
  onZmena: (rozlozeni: WidgetStav[]) => void
}

function sestavRozlozeni(widgety: WidgetDef[], rozlozeni: WidgetStav[] | null): WidgetStav[] {
  const znameId = new Set(widgety.map((w) => w.id))
  const existujici = (rozlozeni ?? []).filter((s) => znameId.has(s.id))
  const chybejici = widgety.filter((w) => !existujici.some((s) => s.id === w.id)).map((w) => ({ id: w.id, viditelny: true }))
  return [...existujici, ...chybejici]
}

export default function WidgetGrid({ widgety, rozlozeni, onZmena }: Props) {
  const [nastaveniOtevrena, setNastaveniOtevrena] = useState(false)
  const stav = sestavRozlozeni(widgety, rozlozeni)
  const podleId = new Map(widgety.map((w) => [w.id, w]))

  function posun(index: number, smer: -1 | 1) {
    const novy = [...stav]
    const cil = index + smer
    if (cil < 0 || cil >= novy.length) return
    ;[novy[index], novy[cil]] = [novy[cil], novy[index]]
    onZmena(novy)
  }

  function prepniViditelnost(index: number) {
    const novy = stav.map((s, i) => (i === index ? { ...s, viditelny: !s.viditelny } : s))
    onZmena(novy)
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setNastaveniOtevrena((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:border-accent hover:text-white"
        >
          ⚙️ Widgety
        </button>
      </div>

      {nastaveniOtevrena && (
        <div className="glass p-4">
          <h3 className="mb-3 text-sm font-medium text-white/70">Viditelnost a pořadí widgetů</h3>
          <ul className="flex flex-col gap-1">
            {stav.map((s, index) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={s.viditelny} onChange={() => prepniViditelnost(index)} />
                  {podleId.get(s.id)?.nazev ?? s.id}
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => posun(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/60 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => posun(index, 1)}
                    disabled={index === stav.length - 1}
                    className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/60 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-4">
        {stav
          .filter((s) => s.viditelny)
          .map((s) => (
            <div key={s.id} className="min-w-0">{podleId.get(s.id)?.node}</div>
          ))}
      </div>
    </div>
  )
}
