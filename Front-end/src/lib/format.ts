const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
})

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

export function decimalToCents(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100)

  const raw = value.trim().replace(/\s/g, '').replace(/^R\$/, '')
  if (!raw) return 0

  const separator = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'))
  const whole = separator >= 0 ? raw.slice(0, separator) : raw
  const fraction = separator >= 0 ? raw.slice(separator + 1) : ''
  const normalizedWhole = whole.replace(/[^\d-]/g, '') || '0'
  const normalizedFraction = fraction.replace(/\D/g, '').padEnd(2, '0').slice(0, 2)
  const sign = normalizedWhole.startsWith('-') ? -1 : 1
  return sign * (Math.abs(Number(normalizedWhole)) * 100 + Number(normalizedFraction))
}

export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(Math.round(cents))
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`
}

export function formatMoney(value: string | number): string {
  return moneyFormatter.format(decimalToCents(value) / 100)
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00-03:00`))
}

export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())
}

export function currentMonth(): { ano: number; mes: number } {
  const [ano, mes] = todayInSaoPaulo().split('-').map(Number)
  return { ano, mes }
}

export function monthBounds(ano: number, mes: number): { from: string; to: string } {
  const lastDay = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return {
    from: `${ano}-${String(mes).padStart(2, '0')}-01`,
    to: `${ano}-${String(mes).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function shiftMonth(ano: number, mes: number, offset: number): { ano: number; mes: number } {
  const date = new Date(Date.UTC(ano, mes - 1 + offset, 1))
  return { ano: date.getUTCFullYear(), mes: date.getUTCMonth() + 1 }
}

export function monthLabel(ano: number, mes: number): string {
  const label = monthFormatter.format(new Date(`${ano}-${String(mes).padStart(2, '0')}-15T12:00:00-03:00`))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function shortMonthLabel(ano: number, mes: number): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    .format(new Date(Date.UTC(ano, mes - 1, 1)))
    .replace('.', '')
}
