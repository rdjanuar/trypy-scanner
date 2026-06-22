export function formatRupiah(value: number) {
  if (value === undefined || value === null) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/Rp\s+/g, 'Rp')
    .trim()
}
