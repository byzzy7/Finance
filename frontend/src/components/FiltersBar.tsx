import type { Clen, Filtr, Kategorie } from '../types'
import { formatMesic } from '../utils/format'

interface Props {
  filtr: Filtr
  onChange: (filtr: Filtr) => void
  mesice: string[]
  kategorie: Kategorie[]
  clenove: Clen[]
}

const selectClass =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent'

export default function FiltersBar({ filtr, onChange, mesice, kategorie, clenove }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={selectClass}
        value={filtr.mesic}
        onChange={(e) => onChange({ ...filtr, mesic: e.target.value })}
      >
        <option value="all">Všechna období</option>
        {mesice.map((m) => (
          <option key={m} value={m}>
            {formatMesic(m)}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filtr.kategorie_id}
        onChange={(e) => onChange({ ...filtr, kategorie_id: e.target.value })}
      >
        <option value="all">Všechny kategorie</option>
        {kategorie.map((k) => (
          <option key={k.id} value={k.id}>
            {k.ikona} {k.nazev}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filtr.clen_id}
        onChange={(e) => onChange({ ...filtr, clen_id: e.target.value })}
      >
        <option value="all">Celá rodina</option>
        {clenove.map((c) => (
          <option key={c.id} value={c.id}>
            {c.jmeno}
          </option>
        ))}
      </select>
    </div>
  )
}
