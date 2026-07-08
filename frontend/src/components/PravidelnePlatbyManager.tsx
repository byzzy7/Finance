import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Kategorie, PeriodaPlatby, TrvalaPlatba, TypTransakce } from '../types'
import type { TrvalaPlatbaVstup } from '../api/trvalePlatby'
import { ApiError } from '../api/client'
import { formatKc } from '../utils/format'

interface Props {
  platby: TrvalaPlatba[]
  kategorie: Kategorie[]
  onCreate: (data: TrvalaPlatbaVstup) => Promise<void>
  onUpdate: (id: number, data: TrvalaPlatbaVstup) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const NAZVY_PERIODY: Record<PeriodaPlatby, string> = {
  tydne: 'Týdně',
  mesicne: 'Měsíčně',
  rocne: 'Ročně',
}

function prazdnyFormular(kategorie: Kategorie[]): TrvalaPlatbaVstup {
  return {
    typ: 'vydaj',
    popis: '',
    kategorie_id: kategorie[0]?.id ?? 0,
    castka: 0,
    perioda: 'mesicne',
    dalsi_datum: new Date().toISOString().slice(0, 10),
    aktivni: true,
  }
}

export default function PravidelnePlatbyManager({ platby, kategorie, onCreate, onUpdate, onDelete }: Props) {
  const [upravovaneId, setUpravovaneId] = useState<number | null>(null)
  const [formular, setFormular] = useState<TrvalaPlatbaVstup>(() => prazdnyFormular(kategorie))
  const [zobrazitFormular, setZobrazitFormular] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)
  const [odesilani, setOdesilani] = useState(false)

  function zacniUpravovat(p: TrvalaPlatba) {
    setUpravovaneId(p.id)
    setFormular({
      typ: p.typ,
      popis: p.popis,
      kategorie_id: p.kategorie_id,
      castka: parseFloat(p.castka),
      perioda: p.perioda,
      dalsi_datum: p.dalsi_datum,
      aktivni: p.aktivni,
    })
    setChyba(null)
    setZobrazitFormular(true)
  }

  function zacniPridavat() {
    setUpravovaneId(null)
    setFormular(prazdnyFormular(kategorie))
    setChyba(null)
    setZobrazitFormular(true)
  }

  function setTyp(typ: TypTransakce) {
    setFormular((f) => ({ ...f, typ }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!formular.popis || formular.kategorie_id <= 0 || formular.castka <= 0 || !formular.dalsi_datum) {
      setChyba('Vyplňte prosím všechna pole správně.')
      return
    }
    setChyba(null)
    setOdesilani(true)
    try {
      if (upravovaneId) {
        await onUpdate(upravovaneId, formular)
      } else {
        await onCreate(formular)
      }
      setZobrazitFormular(false)
    } catch (error) {
      setChyba(error instanceof ApiError ? error.message : 'Uložení se nezdařilo. Zkuste to prosím znovu.')
    } finally {
      setOdesilani(false)
    }
  }

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/70">Trvalé platby</h2>
        <button
          onClick={zacniPridavat}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:border-accent hover:text-white"
        >
          + Nová trvalá platba
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {platby.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.kategorie_ikona}</span>
              <div>
                <div className="font-medium">
                  {p.popis} <span className="text-white/40">· {formatKc(parseFloat(p.castka))}</span>
                  {!p.aktivni && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">Pozastaveno</span>}
                </div>
                <div className="text-xs text-white/40">
                  {NAZVY_PERIODY[p.perioda]} · další {p.dalsi_datum}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => zacniUpravovat(p)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-accent hover:text-white"
              >
                Upravit
              </button>
              <button
                onClick={() => void onDelete(p.id)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-expense/80 hover:border-expense hover:text-expense"
              >
                Smazat
              </button>
            </div>
          </li>
        ))}
      </ul>

      {zobrazitFormular && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 p-4">
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setTyp('vydaj')}
              className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                formular.typ === 'vydaj' ? 'bg-expense text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              Výdaj
            </button>
            <button
              type="button"
              onClick={() => setTyp('prijem')}
              className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                formular.typ === 'prijem' ? 'bg-income text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              Příjem
            </button>
          </div>

          <div>
            <label htmlFor="p-popis" className="mb-1 block text-xs text-white/60">Popis</label>
            <input
              id="p-popis"
              value={formular.popis}
              onChange={(e) => setFormular((f) => ({ ...f, popis: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              placeholder="Např. nájem"
              required
            />
          </div>

          <div>
            <label htmlFor="p-kategorie" className="mb-1 block text-xs text-white/60">Kategorie</label>
            <select
              id="p-kategorie"
              value={formular.kategorie_id}
              onChange={(e) => setFormular((f) => ({ ...f, kategorie_id: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              {kategorie.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ikona} {k.nazev}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="p-castka" className="mb-1 block text-xs text-white/60">Částka (Kč)</label>
              <input
                id="p-castka"
                type="number"
                step="0.01"
                min="0.01"
                value={formular.castka || ''}
                onChange={(e) => setFormular((f) => ({ ...f, castka: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="p-perioda" className="mb-1 block text-xs text-white/60">Perioda</label>
              <select
                id="p-perioda"
                value={formular.perioda}
                onChange={(e) => setFormular((f) => ({ ...f, perioda: e.target.value as PeriodaPlatby }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="tydne">Týdně</option>
                <option value="mesicne">Měsíčně</option>
                <option value="rocne">Ročně</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="p-datum" className="mb-1 block text-xs text-white/60">Další datum platby</label>
            <input
              id="p-datum"
              type="date"
              value={formular.dalsi_datum}
              onChange={(e) => setFormular((f) => ({ ...f, dalsi_datum: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={formular.aktivni}
              onChange={(e) => setFormular((f) => ({ ...f, aktivni: e.target.checked }))}
              className="h-4 w-4 rounded border-white/10 bg-white/5"
            />
            Aktivní
          </label>

          {chyba && <p className="text-sm text-expense">{chyba}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={odesilani}
              className="gradient-btn flex-1 rounded-lg py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {odesilani ? 'Ukládání…' : 'Uložit'}
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
