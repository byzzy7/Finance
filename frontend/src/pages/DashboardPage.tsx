import { useEffect, useMemo, useState } from 'react'
import { kategorieApi } from '../api/kategorie'
import { clenoveApi } from '../api/clenove'
import { transakceApi } from '../api/transakce'
import { filtryApi } from '../api/filtry'
import { rozlozeniApi } from '../api/rozlozeni'
import type { Clen, Filtr, Kategorie, Transakce, WidgetStav } from '../types'
import SummaryCards from '../components/SummaryCards'
import CategoryChart from '../components/CategoryChart'
import TrendChart from '../components/TrendChart'
import TransactionsTable from '../components/TransactionsTable'
import TransactionFormModal from '../components/TransactionFormModal'
import FiltersBar from '../components/FiltersBar'
import SavedFiltersMenu from '../components/SavedFiltersMenu'
import WidgetGrid from '../components/WidgetGrid'
import type { WidgetDef } from '../components/WidgetGrid'

const PRAZDNY_FILTR: Filtr = { mesic: 'all', kategorie_id: 'all', clen_id: 'all' }

export default function DashboardPage() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([])
  const [clenove, setClenove] = useState<Clen[]>([])
  const [transakce, setTransakce] = useState<Transakce[]>([])
  const [ulozeneFiltry, setUlozeneFiltry] = useState<Awaited<ReturnType<typeof filtryApi.list>>>([])
  const [rozlozeni, setRozlozeni] = useState<WidgetStav[] | null>(null)
  const [filtr, setFiltr] = useState<Filtr>(PRAZDNY_FILTR)
  const [nacitani, setNacitani] = useState(true)
  const [modalOtevreno, setModalOtevreno] = useState(false)
  const [upravovana, setUpravovana] = useState<Transakce | null>(null)

  async function nacistTransakce(aktivniFiltr: Filtr) {
    const data = await transakceApi.list({ kategorie_id: aktivniFiltr.kategorie_id, clen_id: aktivniFiltr.clen_id })
    setTransakce(data)
  }

  useEffect(() => {
    Promise.all([kategorieApi.list(), clenoveApi.list(), filtryApi.list(), rozlozeniApi.get()])
      .then(([k, c, f, r]) => {
        setKategorie(k)
        setClenove(c)
        setUlozeneFiltry(f)
        setRozlozeni(r)
      })
      .then(() => nacistTransakce(filtr))
      .finally(() => setNacitani(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (nacitani) return
    void nacistTransakce(filtr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtr.kategorie_id, filtr.clen_id])

  const mesice = useMemo(() => {
    const set = new Set(transakce.map((t) => t.datum.substring(0, 7)))
    return Array.from(set).sort().reverse()
  }, [transakce])

  const transakcePodleMesice = useMemo(() => {
    if (filtr.mesic === 'all') return transakce
    return transakce.filter((t) => t.datum.startsWith(filtr.mesic))
  }, [transakce, filtr.mesic])

  async function ulozitTransakci(data: Parameters<typeof transakceApi.create>[0], id?: number) {
    if (id) {
      await transakceApi.update(id, data)
    } else {
      await transakceApi.create(data)
    }
    await nacistTransakce(filtr)
  }

  async function smazatTransakci(t: Transakce) {
    if (!confirm(`Opravdu smazat "${t.popis}"?`)) return
    await transakceApi.remove(t.id)
    await nacistTransakce(filtr)
  }

  async function ulozitFiltr(nazev: string) {
    const novy = await filtryApi.create(nazev, filtr)
    setUlozeneFiltry((prev) => [{ id: novy.id, nazev, filtr }, ...prev])
  }

  async function smazatFiltr(id: number) {
    await filtryApi.remove(id)
    setUlozeneFiltry((prev) => prev.filter((f) => f.id !== id))
  }

  async function zmenitRozlozeni(nove: WidgetStav[]) {
    setRozlozeni(nove)
    await rozlozeniApi.save(nove)
  }

  if (nacitani) {
    return <div className="text-white/50">Načítání dat…</div>
  }

  const widgety: WidgetDef[] = [
    { id: 'souhrn', nazev: 'Souhrn', node: <SummaryCards transakce={transakcePodleMesice} /> },
    {
      id: 'grafy',
      nazev: 'Grafy',
      node: (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryChart transakce={transakcePodleMesice} />
          <TrendChart transakce={transakce} />
        </div>
      ),
    },
    {
      id: 'tabulka',
      nazev: 'Tabulka transakcí',
      node: (
        <TransactionsTable
          transakce={transakcePodleMesice}
          onEdit={(t) => {
            setUpravovana(t)
            setModalOtevreno(true)
          }}
          onDelete={(t) => void smazatTransakci(t)}
        />
      ),
    },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltersBar filtr={filtr} onChange={setFiltr} mesice={mesice} kategorie={kategorie} clenove={clenove} />
        <div className="flex gap-3">
          <SavedFiltersMenu
            ulozene={ulozeneFiltry}
            filtr={filtr}
            onApply={setFiltr}
            onSave={ulozitFiltr}
            onDelete={smazatFiltr}
          />
          <button
            onClick={() => {
              setUpravovana(null)
              setModalOtevreno(true)
            }}
            className="gradient-btn rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            + Přidat transakci
          </button>
        </div>
      </div>

      <WidgetGrid widgety={widgety} rozlozeni={rozlozeni} onZmena={zmenitRozlozeni} />

      <TransactionFormModal
        otevreno={modalOtevreno}
        kategorie={kategorie}
        upravovana={upravovana}
        onClose={() => setModalOtevreno(false)}
        onSubmit={ulozitTransakci}
      />
    </div>
  )
}
