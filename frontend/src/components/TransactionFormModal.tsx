import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Kategorie, Transakce, TypTransakce } from '../types'
import type { TransakceVstup } from '../api/transakce'

interface Props {
  otevreno: boolean
  kategorie: Kategorie[]
  upravovana: Transakce | null
  onClose: () => void
  onSubmit: (data: TransakceVstup, id?: number) => Promise<void>
}

const prazdnyStav = (kategorie: Kategorie[]): TransakceVstup => ({
  typ: 'vydaj',
  popis: '',
  kategorie_id: kategorie[0]?.id ?? 0,
  castka: 0,
  datum: new Date().toISOString().slice(0, 10),
})

export default function TransactionFormModal({ otevreno, kategorie, upravovana, onClose, onSubmit }: Props) {
  const [stav, setStav] = useState<TransakceVstup>(() => prazdnyStav(kategorie))
  const [odesilani, setOdesilani] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    if (!otevreno) return
    setChyba(null)
    if (upravovana) {
      setStav({
        typ: upravovana.typ,
        popis: upravovana.popis,
        kategorie_id: upravovana.kategorie_id,
        castka: parseFloat(upravovana.castka),
        datum: upravovana.datum,
      })
    } else {
      setStav(prazdnyStav(kategorie))
    }
  }, [otevreno, upravovana, kategorie])

  if (!otevreno) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!stav.popis || stav.kategorie_id <= 0 || stav.castka <= 0 || !stav.datum) {
      setChyba('Vyplňte prosím všechna pole správně.')
      return
    }
    setOdesilani(true)
    setChyba(null)
    try {
      await onSubmit(stav, upravovana?.id)
      onClose()
    } catch {
      setChyba('Uložení se nezdařilo. Zkuste to prosím znovu.')
    } finally {
      setOdesilani(false)
    }
  }

  function setTyp(typ: TypTransakce) {
    setStav((s) => ({ ...s, typ }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="glass-modal glow-ring w-full max-w-md p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{upravovana ? 'Upravit transakci' : 'Přidat transakci'}</h2>

        <div className="mb-4 flex overflow-hidden rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setTyp('vydaj')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              stav.typ === 'vydaj' ? 'bg-expense text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            Výdaj
          </button>
          <button
            type="button"
            onClick={() => setTyp('prijem')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              stav.typ === 'prijem' ? 'bg-income text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            Příjem
          </button>
        </div>

        <label htmlFor="t-popis" className="mb-1 block text-sm text-white/70">Popis</label>
        <input
          id="t-popis"
          value={stav.popis}
          onChange={(e) => setStav((s) => ({ ...s, popis: e.target.value }))}
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
          placeholder="Např. nákup potravin"
          required
        />

        <label htmlFor="t-kategorie" className="mb-1 block text-sm text-white/70">Kategorie</label>
        <select
          id="t-kategorie"
          value={stav.kategorie_id}
          onChange={(e) => setStav((s) => ({ ...s, kategorie_id: Number(e.target.value) }))}
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
        >
          {kategorie.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ikona} {k.nazev}
            </option>
          ))}
        </select>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="t-castka" className="mb-1 block text-sm text-white/70">Částka (Kč)</label>
            <input
              id="t-castka"
              type="number"
              step="0.01"
              min="0.01"
              value={stav.castka || ''}
              onChange={(e) => setStav((s) => ({ ...s, castka: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="t-datum" className="mb-1 block text-sm text-white/70">Datum</label>
            <input
              id="t-datum"
              type="date"
              value={stav.datum}
              onChange={(e) => setStav((s) => ({ ...s, datum: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-accent"
              required
            />
          </div>
        </div>

        {chyba && <p className="mb-4 text-sm text-expense">{chyba}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={odesilani}
            className="gradient-btn flex-1 rounded-lg py-2 font-medium text-white disabled:opacity-60"
          >
            {odesilani ? 'Ukládání…' : 'Uložit'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 py-2 font-medium text-white/70 hover:text-white"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  )
}
