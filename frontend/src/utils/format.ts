export const NAZVY_MESICU_DLOUHE = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

export function formatKc(castka: number): string {
  return `${castka.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč`
}

export function formatMesic(klic: string): string {
  const [rok, mesic] = klic.split('-')
  return `${NAZVY_MESICU_DLOUHE[parseInt(mesic, 10) - 1]} ${rok}`
}
