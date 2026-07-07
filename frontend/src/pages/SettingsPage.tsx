import { useEffect, useMemo, useState } from 'react'
import { kategorieApi } from '../api/kategorie'
import { clenoveApi } from '../api/clenove'
import { transakceApi } from '../api/transakce'
import type { Clen, Kategorie, Transakce } from '../types'
import CategoryManager from '../components/CategoryManager'
import MemberManager from '../components/MemberManager'

export default function SettingsPage() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([])
  const [clenove, setClenove] = useState<Clen[]>([])
  const [transakceMesice, setTransakceMesice] = useState<Transakce[]>([])
  const [nacitani, setNacitani] = useState(true)

  const aktualniMesic = new Date().toISOString().slice(0, 7)

  async function nacistVse() {
    const [k, c, t] = await Promise.all([
      kategorieApi.list(),
      clenoveApi.list(),
      transakceApi.list({ mesic: aktualniMesic }),
    ])
    setKategorie(k)
    setClenove(c)
    setTransakceMesice(t)
  }

  useEffect(() => {
    nacistVse().finally(() => setNacitani(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const vydajeMesice = useMemo(() => {
    const mapa = new Map<number, number>()
    transakceMesice
      .filter((t) => t.typ === 'vydaj')
      .forEach((t) => mapa.set(t.kategorie_id, (mapa.get(t.kategorie_id) ?? 0) + parseFloat(t.castka)))
    return mapa
  }, [transakceMesice])

  if (nacitani) {
    return <div className="text-white/50">Načítání…</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryManager
        kategorie={kategorie}
        vydajeMesice={vydajeMesice}
        onCreate={async (data) => {
          await kategorieApi.create(data)
          await nacistVse()
        }}
        onUpdate={async (data) => {
          await kategorieApi.update(data)
          await nacistVse()
        }}
        onDelete={async (id) => {
          if (!confirm('Opravdu smazat tuto kategorii?')) return
          await kategorieApi.remove(id)
          await nacistVse()
        }}
      />

      <MemberManager
        clenove={clenove}
        onCreate={async (data) => {
          await clenoveApi.create(data)
          await nacistVse()
        }}
      />
    </div>
  )
}
