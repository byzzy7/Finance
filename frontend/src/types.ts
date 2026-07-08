export interface Clen {
  id: number
  uzivatelske_jmeno: string
  jmeno: string
  barva: string
}

export interface Kategorie {
  id: number
  nazev: string
  ikona: string
  barva: string
  mesicni_limit: number | null
  poradi: number
}

export type TypTransakce = 'prijem' | 'vydaj'

export interface Transakce {
  id: number
  clen_id: number
  kategorie_id: number
  typ: TypTransakce
  popis: string
  castka: string
  datum: string
  kategorie_nazev: string
  kategorie_ikona: string
  kategorie_barva: string
  clen_jmeno: string
  clen_barva: string
}

export type PeriodaPlatby = 'tydne' | 'mesicne' | 'rocne'

export interface TrvalaPlatba {
  id: number
  clen_id: number
  kategorie_id: number
  typ: TypTransakce
  popis: string
  castka: string
  perioda: PeriodaPlatby
  dalsi_datum: string
  aktivni: boolean
  kategorie_nazev: string
  kategorie_ikona: string
  kategorie_barva: string
  clen_jmeno: string
  clen_barva: string
}

export interface Filtr {
  mesic: string
  kategorie_id: string
  clen_id: string
}

export interface UlozenyFiltr {
  id: number
  nazev: string
  filtr: Filtr
}

export interface WidgetStav {
  id: string
  viditelny: boolean
}
